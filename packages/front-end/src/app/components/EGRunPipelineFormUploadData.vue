<script setup lang="ts">
  import EGButton from './EGButton.vue';

  // Example CSV file for 3-pairs of fastq files
  /*
  sample,fastq_1,fastq_2
  GOL2051A64544_S114_L002,s3://demo-easy-genomics-nf-tower-bucket/64f9d3be-a716-4def-ad92-5fda460d474f/GOL2051A64544_S114_L002_R1_001.fastq.gz,s3://demo-easy-genomics-nf-tower-bucket/64f9d3be-a716-4def-ad92-5fda460d474f/GOL2051A64544_S114_L002_R2_001.fastq.gz
  GOL2051A64547_S115_L002,s3://demo-easy-genomics-nf-tower-bucket/64f9d3be-a716-4def-ad92-5fda460d474f/GOL2051A64547_S115_L002_R1_001.fastq.gz,s3://demo-easy-genomics-nf-tower-bucket/64f9d3be-a716-4def-ad92-5fda460d474f/GOL2051A64547_S115_L002_R2_001.fastq.gz
  GOL2051A55857_S103_L002,s3://demo-easy-genomics-nf-tower-bucket/64f9d3be-a716-4def-ad92-5fda460d474f/GOL2051A55857_S103_L002_R1_001.fastq.gz,s3://demo-easy-genomics-nf-tower-bucket/64f9d3be-a716-4def-ad92-5fda460d474f/GOL2051A55857_S103_L002_R2_001.fastq.gz
  */

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

  const emit = defineEmits(['next-tab']);

  const chooseFilesButton = ref<HTMLButtonElement | null>(null);

  const filesToUpload = ref<File[]>([]);
  // const fileList: FileList = ref<FileList>();
  const filePairs: FilePair[] = reactive([]);

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
  ];

  function chooseFiles() {
    chooseFilesButton.value?.click();
  }

  function handleDroppedFiles(e: DragEvent) {
    if (!e.isTrusted) {
      console.error('Drop event not trusted');
      return;
    }

    const files: FilePairsForTable = e.dataTransfer?.files;
    if (!files) return;

    processFilePairsForTable(files);
  }

  function handleFileInputChange(e: Event) {
    if (!e.isTrusted) {
      console.error('File input change event not trusted');
      return;
    }

    const files: FilePairsForTable = e.target.files;
    if (!files) return;

    processFilePairsForTable(files);
  }

  function processFilePairsForTable(files: FilePairsForTable) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      addFile(file);
    }
  }

  function fileExists(files: File[], newFile: File): boolean {
    return files.some((file) => file.name === newFile.name);
  }

  function addFile(file: File) {
    const isDuplicateFile = false; // fileExists(filesToUpload.value, file);
    if (isDuplicateFile) {
      console.warn(`File ${file.name} already exists`);
      return;
    }

    addFileToFilesToUpload(file);
    addFileToFilePairs(file);

    console.log('filesToUpload', toRaw(filesToUpload.value));
    console.log('filePairs', toRaw(filePairs));
  }

  function addFileToFilesToUpload(file: File) {
    filesToUpload.value.push(file);
  }

  function addFileToFilePairs(file: File) {
    const uploadFile = getUploadFile(file);
    const sampleId = getSampleIdFromFileName(file.name);
    const existingFilePair = filePairs.find((filePair) => filePair.sampleId === sampleId);
    const filePair: FilePair = existingFilePair || { sampleId };

    try {
      addUploadFileToFilePair(uploadFile, filePair);
      if (!existingFilePair) {
        filePairs.push(filePair);
      }
    } catch (error: Error) {
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

  function toggleDropzoneActive() {
    isDropzoneActive.value = !isDropzoneActive.value;
    console.log('isDropzoneActive', toRaw(isDropzoneActive.value));
  }

  const filePairsForTable = computed(() => {
    if (filePairs.length === 0) return [];

    return filePairs.map((filePair: FilePair) => {
      const { sampleId, r1File, r2File } = filePair;
      return { sampleId, r1File: r1File?.name, r2File: r2File?.name };
    });
  });
</script>

<template>
  <div class="pb-16" @drop.prevent="handleDroppedFiles">
    <div
      id="dropzone"
      @dragenter.prevent="toggleDropzoneActive"
      @dragleave.prevent="toggleDropzoneActive"
      @dragover.prevent
      @drop.prevent="toggleDropzoneActive"
      class="mb-8"
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

  <UTable v-if="filePairsForTable.length > 0" :columns="columns" :rows="filePairsForTable" />
</template>
