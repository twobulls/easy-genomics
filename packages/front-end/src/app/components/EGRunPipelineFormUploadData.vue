<script setup lang="ts">
  import { ButtonVariantEnum, ButtonSizeEnum } from '~/types/buttons';

  type FilePair = {
    sampleId: string; // Common start if the file names for the pair e.g. GOL2051A67473_S133_L002 when uploading a pair of files GOL2051A67473_S133_L002_R1_001.fastq.gz and GOL2051A67473_S133_L002_R2_001.fastq.gz
    r1File?: UploadedFile;
    r2File?: UploadedFile;
  };

  type UploadedFile = {
    progress: number;
    percentage: number;
    name: string;
    location?: string;
    url?: string;
    error?: string;
  };

  const emit = defineEmits(['next-tab', 'step-validated']);

  const chooseFilesButton = ref<HTMLButtonElement | null>(null);

  const canGetUploadPaths = ref(false);
  const canGetSignedUrls = ref(false);
  const canUploadFiles = ref(false);
  const isUploadProcessRunning = ref(false);
  const canProceed = ref(false);
  const filesToUpload = ref<File[]>([]);
  // const filePairs: FilePair[] = reactive([]);
  const filePairs = ref<FilePair[]>([]);

  const progressUpdated = ref(0);
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

    updateFilePairs(files);
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

    updateFilePairs(files);
  }

  function updateFilePairs(files: FileList) {
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
    let haveMatchingFilePairs = true;
    for (const filePair of filePairs.value) {
      if (!filePair.r1File || !filePair.r2File) {
        haveMatchingFilePairs = false;
        break;
      }
    }

    canGetUploadPaths.value = haveMatchingFilePairs;
  }

  function fileExists(files: File[], newFile: File): boolean {
    return files.some((file) => file.name === newFile.name);
  }

  function addFile(file: File) {
    const isDuplicateFile = fileExists(filesToUpload.value, file);
    if (isDuplicateFile) {
      console.warn(`File ${file.name} already exists`);
      return;
    }

    addFileToFilesToUpload(file);
    addFileToFilePairs(file);

    console.log('filesToUpload', toRaw(filesToUpload.value));
    console.log('filePairs', toRaw(filePairs.value));
  }

  function addFileToFilesToUpload(file: File) {
    filesToUpload.value.push(file);
  }

  function addFileToFilePairs(file: File) {
    const uploadFile = getUploadFile(file);
    const sampleId = getSampleIdFromFileName(file.name);
    const existingFilePair = filePairs.value.find((filePair) => filePair.sampleId === sampleId);
    const filePair: FilePair = existingFilePair || { sampleId };

    try {
      addUploadFileToFilePair(uploadFile, filePair);
      if (!existingFilePair) {
        filePairs.value.push(filePair);
      }
    } catch (error: any) {
      console.warn(error.message);
    }
  }

  function addUploadFileToFilePair(uploadFile: UploadedFile, filePair: FilePair) {
    if (uploadFile.name.includes('_R1_')) {
      filePair.r1File = uploadFile;
    } else if (uploadFile.name.includes('_R2_')) {
      filePair.r2File = uploadFile;
    } else {
      throw new Error(`File ${uploadFile.name} does not contain _R1_ or _R2_`);
    }
  }

  function getUploadFile(file: File): UploadedFile {
    return {
      progress: 0,
      percentage: 0,
      name: file.name,
    };
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

      // const rowClass = r1File && r2File ? undefined : 'bg-alert-danger-muted';
      // return { sampleId, r1File: r1File?.name, r2File: r2File?.name, class: rowClass };

      return { sampleId, r1File: r1File?.name, r2File: r2File?.name };
    });
  });

  async function startUploadProcess() {
    isUploadProcessRunning.value = true;
    await uploadFiles();
    isUploadProcessRunning.value = false;
  }

  async function uploadFiles() {}

  watch(canProceed, (val) => {
    emit('step-validated', val);
  });
</script>

<template>
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
      :disabled="!canGetUploadPaths"
      :loading="isUploadProcessRunning"
      :size="ButtonSizeEnum.enum.sm"
      label="Upload Files"
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
