<script setup lang="ts">
  import axios from 'axios';
  import { v4 as uuidv4 } from 'uuid';
  import { ButtonVariantEnum, ButtonSizeEnum } from '~/types/buttons';
  import {
    FileInfo,
    FileUploadInfo,
    FileUploadManifest,
    FileUploadRequest,
  } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/upload/s3-file-upload-manifest';
  import {
    SampleSheetRequest,
    SampleSheetResponse,
    UploadedFileInfo,
    UploadedFilePairInfo,
  } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/upload/s3-file-upload-sample-sheet';

  type FilePair = {
    sampleId: string; // Common start of the file name for each of the file pair e.g. GOL2051A67473_S133_L002 when uploading the pair of files GOL2051A67473_S133_L002_R1_001.fastq.gz and GOL2051A67473_S133_L002_R2_001.fastq.gz
    r1File?: FileDetails;
    r2File?: FileDetails;
  };

  type FileDetails = {
    file: File;
    progress: number;
    percentage: number;
    name: string;
    size: number;
    location?: string;
    url?: string;
    error?: string;
  };

  const { $api } = useNuxtApp();
  const $route = useRoute();

  const emit = defineEmits(['next-step', 'previous-step', 'step-validated']);

  const labId = $route.params.labId as string;

  // TODO: Move transactionId to store and generate at step 01
  const transactionId = uuidv4();

  const chooseFilesButton = ref<HTMLButtonElement | null>(null);

  const filesToUpload = ref<FileDetails[]>([]);
  const filePairs = ref<FilePair[]>([]);

  const canUploadFiles = ref(false);
  const isUploadProcessRunning = ref(false);
  const canProceed = ref(false);
  const isDropzoneActive = ref(false);

  const columns = [
    {
      key: 'sampleId',
      label: 'Sample ID',
    },
    {
      key: 'r1File',
      label: 'R1 File',
    },
    {
      key: 'r2File',
      label: 'R2 File',
    },
    {
      key: 'actions',
      label: '',
    },
  ];

  function chooseFiles() {
    chooseFilesButton.value?.click();
  }

  function handleDroppedFiles(e: DragEvent) {
    if (!e.isTrusted) {
      console.error('Drop event not trusted');
      return;
    }

    const files = e.dataTransfer?.files;
    if (!files) return;

    addFiles(files);
  }

  function handleFileInputChange(e: Event) {
    if (!e.isTrusted) {
      console.error('File input change event not trusted');
      return;
    }

    if (!e.target) {
      console.error('File input change event target not found');
      return;
    }

    const files: FileList = e.target.files;
    if (!files) return;

    addFiles(files);
  }

  function addFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      addFile(file);
    }

    validateFilePairs();
  }

  /**
   * Validate that each file pair has an R1 and R2 file
   */
  function validateFilePairs() {
    let haveMatchingFilePairs = filePairs.value.length > 0;

    for (const filePair of filePairs.value) {
      console.log('Validating file pair:', filePair);
      console.log('R1 file:', filePair.r1File);
      console.log('R2 file:', filePair.r2File);
      if (!filePair.r1File || !filePair.r2File) {
        haveMatchingFilePairs = false;
        break;
      }
    }

    canUploadFiles.value = haveMatchingFilePairs;

    console.log('Can upload files:', canUploadFiles.value);
  }

  function addFile(file: File) {
    const isDuplicateFile = checkIsFileDuplicate(file);
    if (isDuplicateFile) {
      console.warn(`File ${file.name} already exists`);
      return;
    }

    const fileDetails = getFileDetails(file);
    filesToUpload.value.push(fileDetails);
    addFileToFilePairs(fileDetails);

    console.log('filesToUpload', toRaw(filesToUpload.value));
    console.log('filePairs', toRaw(filePairs.value));
  }

  function checkIsFileDuplicate(newFile: File): boolean {
    return filesToUpload.value.some((fileDetails: FileDetails) => fileDetails.name === newFile.name);
  }

  function getFileDetails(file: File): FileDetails {
    return {
      file,
      size: file.size,
      progress: 0,
      percentage: 0,
      name: file.name,
    };
  }

  function addFileToFilePairs(fileDetails: FileDetails) {
    const sampleId = getSampleIdFromFileName(fileDetails.name);
    const existingFilePair = filePairs.value.find((filePair) => filePair.sampleId === sampleId);
    const filePair: FilePair = existingFilePair || { sampleId };

    try {
      addToFilePair(fileDetails, filePair);
      if (!existingFilePair) {
        filePairs.value.push(filePair);
      }
    } catch (error: any) {
      console.warn(error.message);
    }
  }

  function addToFilePair(fileDetails: FileDetails, filePair: FilePair) {
    if (fileDetails.name.includes('_R1_')) {
      filePair.r1File = fileDetails;
    } else if (fileDetails.name.includes('_R2_')) {
      filePair.r2File = fileDetails;
    } else {
      throw new Error(`File ${fileDetails.name} does not contain _R1_ or _R2_`);
    }
  }

  function getSampleIdFromFileName(fileName: string): string {
    return fileName.substring(0, fileName.lastIndexOf('_R'));
  }

  function removeFilePair(sampleId: string) {
    console.log('Removing file pair; sampleId:', sampleId);
    filesToUpload.value = filesToUpload.value.filter((file) => !file.name.startsWith(sampleId));
    filePairs.value = filePairs.value.filter((filePair) => filePair.sampleId !== sampleId);
    console.log('Removed file pair; sampleId:', sampleId);

    validateFilePairs();
  }

  function toggleDropzoneActive() {
    isDropzoneActive.value = !isDropzoneActive.value;
    console.log('isDropzoneActive', toRaw(isDropzoneActive.value));
  }

  const filePairsForTable = computed(() => {
    if (filePairs.value.length === 0) return [];

    return filePairs.value.map((filePair: FilePair) => {
      const { sampleId, r1File, r2File } = filePair;
      return { sampleId, r1File: r1File?.name, r2File: r2File?.name };
    });
  });

  async function startUploadProcess() {
    isUploadProcessRunning.value = true;
    const uploadManifest = await getUploadFilesManifest();
    addUploadUrls(uploadManifest);
    await uploadFiles();
    const uploadedFilePairs: UploadedFilePairInfo[] = getUploadedFilePairs(uploadManifest);
    const sampleSheetResponse: SampleSheetResponse = await getSampleSheetCsv(uploadedFilePairs);
    console.log('Sample sheet response:', sampleSheetResponse);

    isUploadProcessRunning.value = false;

    canProceed.value = true;
  }

  function removeQueryStringFromS3Url(s3Url: string): string {
    return s3Url.split('?')[0];
  }

  function getUploadedFilePairs(uploadManifest: FileUploadManifest): UploadedFilePairInfo[] {
    const uploadedFilePairs: UploadedFilePairInfo[] = [];

    uploadManifest.Files.forEach((file: FileUploadInfo) => {
      const { Bucket, Key, Name, Region, S3Url } = file;
      const url = removeQueryStringFromS3Url(S3Url);
      console.log('Uploaded file:', Name, url);

      const uploadFileInfo: UploadedFileInfo = {
        Bucket,
        Key,
        Region,
        S3Url: url,
      };
      const sampleId = getSampleIdFromFileName(Name);
      const existingFilePair = uploadedFilePairs.find((filePair) => filePair.SampleId === sampleId);
      if (existingFilePair) {
        if (file.Name.includes('_R1_')) {
          existingFilePair.R1 = uploadFileInfo;
        } else if (file.Name.includes('_R2_')) {
          existingFilePair.R2 = uploadFileInfo;
        }
      } else {
        const newFilePair: UploadedFilePairInfo = {
          SampleId: sampleId,
          R1: Name.includes('_R1_') ? uploadFileInfo : undefined,
          R2: Name.includes('_R2_') ? uploadFileInfo : undefined,
        };
        uploadedFilePairs.push(newFilePair);
      }
    });

    console.log('uploadedFilePairs:', uploadedFilePairs);

    return uploadedFilePairs;
  }

  async function getSampleSheetCsv(uploadedFilePairs: UploadedFilePairInfo[]): Promise<SampleSheetResponse> {
    const request: SampleSheetRequest = {
      LaboratoryId: labId,
      TransactionId: transactionId,
      UploadedFilePairs: uploadedFilePairs,
    };
    return await $api.uploads.getSampleSheetCsv(request);
  }

  async function getUploadFilesManifest(): Promise<FileUploadManifest> {
    const files: FileInfo[] = [];
    for (const fileDetails of filesToUpload.value) {
      files.push({
        Name: fileDetails.name,
        Size: fileDetails.size,
      });
    }

    const request: FileUploadRequest = {
      LaboratoryId: labId,
      TransactionId: transactionId,
      Files: files,
    };

    console.log('Get file upload manifest request:', request);

    const response = await $api.uploads.getFileUploadManifest(request);

    console.log('Get file upload manifest response:', response);

    return response;
  }

  function addUploadUrls(uploadManifest: FileUploadManifest) {
    filesToUpload.value.forEach((fileDetails) => {
      const fileUploadInfo = uploadManifest.Files.find((file) => file.Name === fileDetails.name);
      if (fileUploadInfo) {
        fileDetails.url = fileUploadInfo.S3Url;
      }
    });
  }

  async function uploadFiles() {
    console.log('Uploading files:', filesToUpload.value.length);
    await Promise.allSettled(filesToUpload.value.map((fileDetails) => uploadFile(fileDetails)));
    console.log('Uploaded files:', filesToUpload.value.length);
  }

  async function uploadFile(fileDetails: FileDetails) {
    const { file, name } = fileDetails;

    return axios.put(fileDetails.url!, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent?.loaded / progressEvent.total) * 100);
        fileDetails.progress = progress;
        fileDetails.percentage = progress;
        console.log(`${name}; Upload progress: ${progress}%`);
      },
    });
  }

  watch(canProceed, (val) => {
    emit('step-validated', val);
  });
</script>

<template>
  <EGCard>
    <EGText tag="small" class="mb-4">Step 02</EGText>
    <EGText tag="h4" class="mb-0">Upload Data</EGText>
    <EGText tag="small" class="mb-0" color-class="text-muted">
      Any similar files with the suffix _R1 or _R2 Will be combined as paired-end data samples. Max file size of 5GB
    </EGText>
    <UDivider class="py-4" />
    <div class="py-4" @drop.prevent="handleDroppedFiles">
      <div
        id="dropzone"
        @dragenter.prevent="toggleDropzoneActive"
        @dragleave.prevent="toggleDropzoneActive"
        @dragover.prevent
        @drop.prevent="toggleDropzoneActive"
      >
        <div
          :class="
            cn(
              'ring-primary-500 text-body flex w-full items-center justify-center rounded-lg py-8 ring-2 ring-offset-1 transition-colors duration-200',
              {
                'bg-alert-success-muted ring-alert-success font-semibold ring-offset-2': isDropzoneActive,
              },
            )
          "
        >
          <div class="flex items-center justify-center">
            <div>
              <span :class="cn('visible', { 'invisible': isDropzoneActive })">Drag and</span>
              drop your files
              <span :class="cn('visible', { 'invisible': isDropzoneActive })">here or</span>
            </div>
            <input
              accept=".gz,.fastq"
              ref="chooseFilesButton"
              type="file"
              id="dropzoneFiles"
              @change="handleFileInputChange"
              hidden
              multiple
            />
            <EGButton
              :class="cn('visible ml-4', { 'invisible': isDropzoneActive })"
              @click="chooseFiles"
              label="Choose Files"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="filePairsForTable.length > 0" class="text-body flex justify-between px-4 pt-2 text-sm">
      <div>Samples: {{ filePairs.length }}</div>
      <div>Files: {{ filesToUpload.length }}</div>
    </div>

    <UTable
      v-if="filePairsForTable.length > 0"
      :columns="columns"
      :rows="filePairsForTable"
      class="EGTable mt-4 rounded-2xl"
    >
      <template #actions-data="{ row }">
        <div class="flex items-center space-x-2">
          <EGButton
            icon="i-heroicons-trash"
            :size="ButtonSizeEnum.enum.xs"
            :variant="ButtonVariantEnum.enum.destructive"
            @click="removeFilePair(row.sampleId)"
          />
        </div>
      </template>
    </UTable>

    <div class="flex justify-end pt-4">
      <EGButton
        @click="startUploadProcess"
        :disabled="!canUploadFiles || isUploadProcessRunning || canProceed"
        :loading="isUploadProcessRunning"
        :size="ButtonSizeEnum.enum.sm"
        label="Upload Files"
      />
    </div>
  </EGCard>

  <div class="mt-6 flex justify-between">
    <EGButton :size="ButtonSizeEnum.enum.sm" variant="secondary" label="Previous step" @click="emit('previous-step')" />
    <EGButton
      :size="ButtonSizeEnum.enum.sm"
      variant="secondary"
      label="Next step"
      @click="emit('next-step')"
      :disabled="!canProceed"
    />
  </div>
</template>

<style lang="scss">
  .EGTable {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    width: 100%;
    table-layout: auto;

    tbody tr {
      td {
        font-size: 12px;
        padding-top: 22px;
        padding-bottom: 22px;
      }
    }
  }
</style>
