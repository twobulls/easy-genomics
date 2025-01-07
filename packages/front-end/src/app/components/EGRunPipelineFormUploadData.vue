<script setup lang="ts">
  import axios from 'axios';
  import { ButtonSizeEnum } from '@FE/types/buttons';
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
  import { useRunStore, useToastStore } from '@FE/stores';
  import usePipeline from '@FE/composables/usePipeline';

  type UploadStatus = 'idle' | 'uploading' | 'success' | 'failed';

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

  interface UploadError {
    fileName: string;
    error: string;
    code?: string;
    userMessage?: string;
  }

  const { $api } = useNuxtApp();
  const $route = useRoute();
  const runStore = useRunStore();
  const { downloadSampleSheet } = usePipeline($api);

  const emit = defineEmits(['next-step', 'previous-step', 'step-validated']);
  defineProps<{
    pipelineId: string;
  }>();

  const labId = $route.params.labId as string;
  const seqeraRunTempId = $route.query.seqeraRunTempId as string;

  const wipSeqeraRun = computed<WipSeqeraRunData | undefined>(() => runStore.wipSeqeraRuns[seqeraRunTempId]);

  const chooseFilesButton = ref<HTMLButtonElement | null>(null);

  const filesToUpload = ref<FileDetails[]>([]);
  const filePairs = ref<FilePair[]>([]);

  const canUploadFiles = ref(false);
  const canProceed = ref(false);
  const isDropzoneActive = ref(false);

  // overall upload status for all files
  const uploadStatus = ref('idle')<UploadStatus>;

  const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
  const MIN_FILE_SIZE = 1; // 1byte

  const columns = [
    {
      key: 'uploadProgress',
    },
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

  const uploadProgressStyles = computed(() => {
    return {
      'upload-status--idle': uploadStatus.value === 'idle',
      'upload-status--uploading': uploadStatus.value === 'uploading',
      'upload-status--success': uploadStatus.value === 'success',
      'upload-status--failed': uploadStatus.value === 'failed',
    };
  });

  const filePairsForTable = computed(() => {
    if (filePairs.value.length === 0) return [];

    return filePairs.value.map((filePair: FilePair) => {
      const { sampleId, r1File, r2File } = filePair;
      const uploadProgress = Math.max(r1File?.percentage ?? 0, r2File?.percentage ?? 0);
      return { sampleId, r1File: r1File?.name, r2File: r2File?.name, uploadProgress };
    });
  });

  const showDropzone = computed(() => !canProceed.value || uploadStatus.value === 'idle');

  const isUploadButtonDisabled = computed(
    () =>
      !canUploadFiles.value ||
      uploadStatus.value === 'uploading' ||
      uploadStatus.value === 'success' ||
      canProceed.value,
  );

  const isRemoveButtonDisabled = computed(
    () => uploadStatus.value !== 'uploading' && uploadStatus.value !== 'success' && !canProceed.value,
  );

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
    const invalidFiles = Array.from(files).filter((file) => !isValidGzFile(file));
    const validFiles = Array.from(files).filter((file) => isValidGzFile(file));

    invalidFiles.forEach((file) => {
      const message = `File ${file.name} is not a .gz file`;
      useToastStore().error(message);
    });

    validFiles.forEach((file) => addFile(file));

    validateFilePairs();
  }

  function isValidGzFile(file: File): boolean {
    return file.name.endsWith('.gz');
  }

  /**
   * Validate that each file pair has an R1 and R2 file
   */
  function validateFilePairs() {
    let haveMatchingFilePairs = filePairs.value.length > 0;

    for (const filePair of filePairs.value) {
      console.debug('Validating file pair:', filePair);
      console.debug('R1 file:', filePair.r1File);
      console.debug('R2 file:', filePair.r2File);
      if (!filePair.r1File || !filePair.r2File) {
        haveMatchingFilePairs = false;
        break;
      }
    }

    canUploadFiles.value = haveMatchingFilePairs;

    console.debug('Can upload files:', canUploadFiles.value);
  }

  function addFile(file: File) {
    console.debug(`Adding file; name: ${file.name}; size: ${file.size} bytes`);

    if (file.size < MIN_FILE_SIZE) {
      const message = `File ${file.name} is too small: ${file.size} bytes`;
      useToastStore().error(message);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const message = `File ${file.name} is too large: ${file.size} bytes. Maximum allowed size is 5GB.`;
      useToastStore().error(message);
      return;
    }

    const isDuplicateFile = checkIsFileDuplicate(file);
    console.debug(`Is ${file.name} duplicate: ${isDuplicateFile}`);

    if (isDuplicateFile) {
      const message = `File ${file.name} already exists`;
      useToastStore().error(message);
      return;
    }

    const fileDetails = getFileDetails(file);
    filesToUpload.value.push(fileDetails);
    addFileToFilePairs(fileDetails);

    console.debug('filesToUpload', toRaw(filesToUpload.value));
    console.debug('filePairs', toRaw(filePairs.value));
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
      console.warn('Error adding file to file pair:', error);
    }
  }

  function addToFilePair(fileDetails: FileDetails, filePair: FilePair) {
    if (fileDetails.name.includes('_R1_')) {
      filePair.r1File = fileDetails;
    } else if (fileDetails.name.includes('_R2_')) {
      filePair.r2File = fileDetails;
    } else {
      const message = `File ${fileDetails.name} does not contain _R1_ or _R2_`;
      useToastStore().error(message);
      throw new Error(message);
    }
  }

  function getSampleIdFromFileName(fileName: string): string {
    return fileName.substring(0, fileName.lastIndexOf('_R'));
  }

  function removeFilePair(sampleId: string) {
    console.debug('Removing file pair; sampleId:', sampleId);
    filesToUpload.value = filesToUpload.value.filter((file) => !file.name.startsWith(sampleId));
    filePairs.value = filePairs.value.filter((filePair) => filePair.sampleId !== sampleId);
    console.debug('Removed file pair; sampleId:', sampleId);

    validateFilePairs();
  }

  function toggleDropzoneActive() {
    isDropzoneActive.value = !isDropzoneActive.value;
    console.debug('isDropzoneActive', toRaw(isDropzoneActive.value));
  }

  async function startUploadProcess() {
    uploadStatus.value = 'uploading';

    const uploadManifest = await getUploadFilesManifest();
    addUploadUrls(uploadManifest);
    await uploadFiles();
    const uploadedFilePairs: UploadedFilePairInfo[] = getUploadedFilePairs(uploadManifest);
    const sampleSheetResponse: SampleSheetResponse = await getSampleSheetCsv(uploadedFilePairs);
    useRunStore().updateWipSeqeraRun(seqeraRunTempId, {
      sampleSheetS3Url: sampleSheetResponse.SampleSheetInfo.S3Url,
      s3Bucket: sampleSheetResponse.SampleSheetInfo.Bucket,
      s3Path: sampleSheetResponse.SampleSheetInfo.Path,
    });

    canProceed.value = true;
  }

  function getUploadedFilePairs(uploadManifest: FileUploadManifest): UploadedFilePairInfo[] {
    const uploadedFilePairs: UploadedFilePairInfo[] = [];

    uploadManifest.Files.forEach((file: FileUploadInfo) => {
      const { Bucket, Key, Name, Region } = file;
      const s3Uri = `s3://${Bucket}/${Key}`;

      const uploadFileInfo: UploadedFileInfo = {
        Bucket,
        Key,
        Region,
        S3Url: s3Uri,
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

    console.debug('uploadedFilePairs:', uploadedFilePairs);

    return uploadedFilePairs;
  }

  async function getSampleSheetCsv(uploadedFilePairs: UploadedFilePairInfo[]): Promise<SampleSheetResponse> {
    const request: SampleSheetRequest = {
      LaboratoryId: labId,
      TransactionId: wipSeqeraRun.value?.transactionId || '',
      UploadedFilePairs: uploadedFilePairs,
    };
    const response = await $api.uploads.getSampleSheetCsv(request);
    console.debug('Get CSV sample sheet response:', response);

    return response;
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
      TransactionId: wipSeqeraRun.value?.transactionId || '',
      Files: files,
    };

    console.debug('Get file upload manifest request:', request);

    const response = await $api.uploads.getFileUploadManifest(request);

    console.debug('Get file upload manifest response:', response);

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

  /**
   * Handles the process of uploading multiple files, tracks their progress, and manages upload results.
   *
   * @returns {Promise<UploadError[]>} - Resolves with an array of failed uploads (if any), containing error details.
   *
   * Purpose:
   * - Initiates the upload of all files in `filesToUpload` using `uploadFile`.
   * - Ensures that all file uploads are completed, regardless of individual successes or failures, using `Promise.allSettled`.
   * - Collects detailed information about any failed uploads, including user-friendly error messages.
   * - Displays meaningful toast notifications for both successful and failed uploads:
   *   - Displays a success toast when all files are uploaded successfully.
   *   - Displays specific error messages for network errors or generic messages for other failures.
   * - Creates and submits a lab run request upon successful uploads.
   *
   * Toast Messaging:
   * - For network errors, displays a detailed user-friendly message.
   * - For other failures, displays specific error messages for individual files or a summary for multiple failed files.
   */
  async function uploadFiles() {
    const results = await Promise.allSettled(filesToUpload.value.map((fileDetails) => uploadFile(fileDetails)));

    const failedUploads: UploadError[] = results
      .map((result, index) => {
        if (result.status === 'rejected') {
          const fileDetails = filesToUpload.value[index];
          return {
            fileName: fileDetails.file.name,
            error: result.reason.message,
            code: result.reason.code,
            userMessage: result.reason.userMessage, // Get the user message if it exists
          };
        }
        return null;
      })
      .filter((error): error is UploadError => error !== null);

    if (failedUploads.length > 0) {
      uploadStatus.value = 'failed';

      // Check if there are any network errors and use their message
      const networkError = failedUploads.find((f) => f.code === 'ERR_NETWORK');
      const errorMessage = networkError
        ? networkError.userMessage
        : failedUploads.length === 1
          ? `Failed to upload ${failedUploads[0].fileName}: ${failedUploads[0].error}`
          : `Failed to upload ${failedUploads.length} files. Check console for details.`;

      useToastStore().error(errorMessage);
      return failedUploads;
    }

    uploadStatus.value = 'success';
    useToastStore().success('Files uploaded successfully');

    const labRunRequest = {
      'Title': wipSeqeraRun.value?.userPipelineRunName,
      'LaboratoryId': wipSeqeraRun.value?.laboratoryId,
      'Status': 'Active',
      'Type': 'Seqera Cloud',
      'OrganizationId': useUserStore().currentOrgId,
      'RunId': wipSeqeraRun.value?.transactionId,
    };
    await $api.labs.createLabRun(labRunRequest);
  }

  /**
   * Uploads a single file to the specified URL using an HTTP PUT request.
   *
   * @param {FileDetails} fileDetails - An object containing file information, including the file, URL, and progress details.
   *
   * @returns {Promise} - Resolves with the response if the upload is successful.
   *                      Rejects with an error object containing the error message, code, and file details if the upload fails.
   *
   * Purpose:
   * - Tracks the progress of the file upload and updates progress/percentage in `fileDetails`.
   * - Handles network errors, rejecting with a detailed error message.
   * - Logs any upload errors to the console for debugging purposes.
   */
  async function uploadFile(fileDetails: FileDetails) {
    const { file } = fileDetails;

    try {
      const response = await axios.put(fileDetails.url!, file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent?.loaded / progressEvent?.total) * 100);
          fileDetails.progress = progress;
          fileDetails.percentage = progress;
        },
      });

      return response;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK') {
        fileDetails.error = 'Network error';
        return Promise.reject({
          message: 'Network error',
          code: 'ERR_NETWORK',
          fileName: file.name,
          userMessage: 'Network error - please check your connection and try again',
        });
      }

      fileDetails.error = error.message || 'Failed to upload';
      fileDetails.percentage = 0;

      console.error('Error uploading file:', {
        fileName: file.name,
        error: error.message,
        code: error.code,
      });

      return Promise.reject({
        message: error.message || 'Failed to upload',
        code: error.code,
        fileName: file.name,
      });
    }
  }

  function showLoadingSpinner(progress: number): boolean {
    return uploadStatus.value === 'uploading' && progress < 100;
  }

  function formatProgress(progress: number): string {
    if (progress === 0) {
      return '0';
    }
    return progress.toString().padStart(2, '0');
  }

  watch(canProceed, (val) => {
    emit('step-validated', val);
  });
</script>

<template>
  <EGCard>
    <EGText tag="small" class="mb-4">Step 02</EGText>
    <EGText tag="h4" class="mb-4">Upload Data</EGText>
    <ul class="text-muted ml-6 mt-1 list-disc text-xs font-normal tracking-tight">
      <li>
        Files containing _R1_ or _R2_ with a matching prefix and suffix will be combined as paired-end data samples e.g,
        <ul>
          <li>
            GOL2051A55857_S103_L002
            <strong>_R1_</strong>
            001.fastq.gz
          </li>
          <li>
            GOL2051A55857_S103_L002
            <strong>_R2_</strong>
            001.fastq.gz
          </li>
        </ul>
      </li>
      <li>5GB max size per individual file</li>
    </ul>
    <UDivider class="py-4" />
    <div class="py-4" @drop.prevent="handleDroppedFiles" v-if="showDropzone">
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
              <span :class="cn('visible', { 'invisible': isDropzoneActive })">Drag and&nbsp;</span>
              <span v-if="isDropzoneActive">Drop</span>
              <span v-else>drop</span>
              your files
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

    <UTable
      v-if="filePairsForTable.length > 0"
      :columns="columns"
      :rows="filePairsForTable"
      class="EGTable mt-1"
      :class="uploadProgressStyles"
    >
      <template #uploadProgress-data="{ row }">
        <div class="flex w-full items-center">
          <EGLoadingSpinner v-if="showLoadingSpinner(row.uploadProgress)" />
          <UIcon
            v-else-if="uploadStatus === 'success'"
            name="i-heroicons-check-20-solid"
            class="bg-alert-success-text h-8 w-8"
          />
          <UIcon
            v-else-if="uploadStatus === 'failed'"
            name="i-heroicons-exclamation-triangle"
            class="bg-alert-danger h-8 w-8"
          />
          <div class="flex w-full items-center justify-end">
            <span class="font-medium" v-if="uploadStatus !== 'idle'">{{ formatProgress(row.uploadProgress) }}%</span>
          </div>
        </div>
      </template>
      <template #actions-data="{ row }">
        <div class="flex items-center space-x-2">
          <UIcon
            v-if="isRemoveButtonDisabled"
            name="i-heroicons-trash"
            @click="removeFilePair(row.sampleId)"
            class="h-6 w-6 cursor-pointer bg-black"
          />
          <UIcon v-else name="i-heroicons-trash" class="h-6 w-6 cursor-default bg-black bg-opacity-30" />
        </div>
      </template>
    </UTable>
    <div class="flex justify-end pt-4">
      <EGButton
        v-if="uploadStatus === 'success'"
        variant="secondary"
        class="mr-2"
        label="Download sample sheet"
        @click="downloadSampleSheet(seqeraRunTempId)"
      />
      <EGButton
        @click="startUploadProcess"
        :disabled="isUploadButtonDisabled"
        :loading="uploadStatus === 'uploading'"
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
    width: 100%;
    table-layout: fixed;

    thead tr th:first-child {
      width: 70px;
      max-width: 70px;
      min-width: 70px;
      padding-left: 0;
      font-weight: 500;
    }

    tbody tr td:nth-child(1) {
      padding-left: 12px;
      padding-right: 0;
      width: 70px !important;
    }

    tbody tr td:nth-child(2) {
      font-weight: 500;
    }

    tbody tr td:not(:first-child) {
      font-size: 12px;
    }

    tbody tr td:last-child {
      width: 50px;
    }

    tbody tr {
      td {
        padding-top: 22px;
        padding-bottom: 22px;
        color: #12181f;
        height: 77px;
      }
    }
    &.upload-status--idle {
      tbody tr {
        td {
        }
      }
    }
    &.upload-status--uploading {
      tbody tr {
        td {
          background: #f7f7f7;
        }
      }
    }

    &.upload-status--failed {
      tbody tr {
        td {
          background: #fdefec;
        }
      }
    }
  }
  .upload-status--success {
    tbody tr {
      td {
        background: #daf4e2;
        color: #306239 !important;
      }
    }
  }
</style>
