<script setup lang="ts">
  import axios from 'axios';
  import { ButtonSizeEnum } from '@FE/types/buttons';
  import {
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
  import { useToastStore } from '@FE/stores';
  import usePipeline from '@FE/composables/usePipeline';
  import { useNetwork } from '@vueuse/core';

  type UploadStatus = 'idle' | 'uploading' | 'success' | 'failed';

  export type FilePair = {
    sampleId: string; // Common start of the file name for each of the file pair e.g. GOL2051A67473_S133_L002 when uploading the pair of files GOL2051A67473_S133_L002_R1_001.fastq.gz and GOL2051A67473_S133_L002_R2_001.fastq.gz
    r1File?: FileDetails;
    r2File?: FileDetails;
  };

  type FileDetails = {
    file: File;
    name: string;
    size: number;
    // progress not present means upload hasn't started yet - this is important for the uploadStatus computed
    progress?: number;
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
  const { downloadSampleSheet } = usePipeline($api);
  const { isOnline } = useNetwork();
  const toastStore = useToastStore();

  const emit = defineEmits(['next-step', 'previous-step', 'step-validated']);
  const props = defineProps<{
    labId: string;
    labName: string;
    pipelineOrWorkflowName: string;
    wipRun: WipSeqeraRunData & WipOmicsRunData; // will be one of these types, and officially can have any common fields
    wipRunUpdateFunction: Function;
    wipRunTempId: string;
  }>();

  const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
  const MIN_FILE_SIZE = 1; // 1byte
  const UPLOAD_TIMEOUT = 600000; // 10 mins
  const UPLOAD_RETRY_DELAY = 3000; // 3 second delay helps prevent immediate retry spam and gives time for temporary network issues to resolve

  const chooseFilesButton = ref<HTMLButtonElement | null>(null);
  const isDropzoneActive = ref(false);

  // Track ongoing upload requests
  const uploadControllers = ref<{ [key: string]: AbortController }>({});

  const filePairs = computed<FilePair[]>(() => {
    // initialize files if not present
    if (props.wipRun.files === undefined) {
      props.wipRun.files = [];
    }

    return props.wipRun.files;
  });

  const files = computed<FileDetails[]>(() => {
    const files = [];
    for (const filePair of filePairs.value) {
      if (filePair.r1File) files.push(filePair.r1File);
      if (filePair.r2File) files.push(filePair.r2File);
    }
    return files;
  });

  const filesNotUploaded = computed<FileDetails[]>(() =>
    files.value.filter((file) => file.error || file.progress !== 100),
  );

  const hasSampleSheetUrl = computed(() => props.wipRun.sampleSheetS3Url);

  const haveUnmatchedFiles = computed<boolean>(() =>
    filePairs.value.some((filePair) => !filePair.r1File || !filePair.r2File),
  );

  const canProceedToNextStep = computed<boolean>(() => {
    // Check both conditions:
    // 1. All existing files are uploaded successfully
    // 2. All pairs are complete (have both R1 and R2)
    return areAllFilesUploaded.value && areAllPairsComplete.value;
  });

  const areAllPairsComplete = computed<boolean>(() => {
    return filePairs.value.every((pair) => pair.r1File && pair.r2File);
  });

  // overall upload status for all files
  const uploadStatus = computed<UploadStatus>(() => {
    // if any file has a progress below 100 and doesn't have an error, upload is in progress
    if (files.value.some((file) => file.progress !== undefined && file.progress < 100 && !file.error))
      return 'uploading';
    // else if any file has an error, upload failed
    if (files.value.some((file) => !!file.error)) return 'failed';
    // else if there are files and they all have progress 100, upload succeeded
    if (files.value.length > 0 && files.value.every((file) => !file.error && file.progress === 100)) return 'success';
    // else must be idle
    return 'idle';
  });

  const filesForTable = computed(() => {
    const files: { sampleId: string; fileName: string; progress: number; error?: string }[] = [];

    filePairs.value.forEach((filePair: FilePair) => {
      if (filePair.r1File) {
        files.push({
          sampleId: filePair.sampleId,
          fileName: filePair.r1File.name,
          progress: filePair.r1File.progress || 0,
          error: filePair.r1File.error,
        });
      }
      if (filePair.r2File) {
        files.push({
          sampleId: filePair.sampleId,
          fileName: filePair.r2File.name,
          progress: filePair.r2File.progress || 0,
          error: filePair.r2File.error,
        });
      }
    });

    return files;
  });

  const isDropzoneEnabled = computed(() => uploadStatus.value !== 'uploading');

  const isUploadButtonDisabled = computed(() => {
    const noInternet = !isOnline.value;
    const noFiles = filesNotUploaded.value.length === 0;
    const hasUnmatched = haveUnmatchedFiles.value;
    const isUploading = uploadStatus.value === 'uploading';

    return noInternet || noFiles || hasUnmatched || isUploading;
  });

  // Add a computed property to check if all file pairs are complete and all files are successfully uploaded
  const areAllFilesUploaded = computed(() => filesNotUploaded.value.length === 0);

  // reset files error states
  function clearErrorsFromFiles(files: FileDetails[]) {
    files.forEach((file) => {
      file.error = undefined;
      file.progress = undefined;
    });
  }

  // set progress to 0 - this makes the computed uploadStatus get set to 'uploading'
  function initializeProgressForFiles(files: FileDetails[]) {
    files.forEach((file) => {
      file.progress = 0;
    });
  }

  // gives error message to all files - used for when an error occurs above the individual file level
  function applyErrorToFiles(files: FileDetails[], errorMessage: string) {
    files.forEach((file) => {
      file.error = errorMessage;
    });
  }

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

    const target = e.target as HTMLInputElement;
    if (!target) {
      console.error('File input change event target not found');
      return;
    }

    const files = target.files;
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
  }

  function isValidGzFile(file: File): boolean {
    return file.name.endsWith('.gz');
  }

  function addFile(file: File) {
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

    if (isDuplicateFile) {
      const message = `File ${file.name} already exists`;
      useToastStore().error(message);
      return;
    }

    const fileDetails = getFileDetails(file);
    addFileToFilePairs(fileDetails);
  }

  function checkIsFileDuplicate(newFile: File): boolean {
    return files.value.some((fileDetails: FileDetails) => fileDetails.name === newFile.name);
  }

  function getFileDetails(file: File): FileDetails {
    return {
      file,
      size: file.size,
      name: file.name,
      progress: undefined, // Reset progress
      error: undefined, // Reset error state
      url: undefined, // Reset upload URL
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

  function setDropzoneActive(val: boolean) {
    isDropzoneActive.value = val;
  }

  async function startUploadProcess() {
    clearErrorsFromFiles(filesNotUploaded.value);
    initializeProgressForFiles(filesNotUploaded.value);

    // pre-upload work - catch and handle errors in this step with applyErrorToFiles
    try {
      const uploadManifest = await getUploadFilesManifest(filesNotUploaded.value);
      addUploadUrls(uploadManifest);
    } catch (error: any) {
      applyErrorToFiles(filesNotUploaded.value, error.message);
      return;
    }

    await uploadFiles();

    await postUploadHook();
  }

  async function postUploadHook() {
    if (filesNotUploaded.value.length === 0) {
      await saveSampleSheetInfo();
    }
  }

  async function saveSampleSheetInfo() {
    // get manifest of all files
    const uploadManifest = await getUploadFilesManifest(files.value);

    const uploadedFilePairs: UploadedFilePairInfo[] = getUploadedFilePairs(uploadManifest);
    // get sample sheet info
    const sampleSheetResponse: SampleSheetResponse = await getSampleSheetCsv(uploadedFilePairs);
    // save to wip run
    const { S3Url, Bucket, Path } = sampleSheetResponse.SampleSheetInfo;
    props.wipRunUpdateFunction(props.wipRunTempId, {
      sampleSheetS3Url: S3Url,
      s3Bucket: Bucket,
      s3Path: Path,
      params: {
        input: S3Url,
        outdir: `s3://${Bucket}/${Path}/results`,
      },
    });
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

    return uploadedFilePairs;
  }

  async function getSampleSheetCsv(uploadedFilePairs: UploadedFilePairInfo[]): Promise<SampleSheetResponse> {
    const request: SampleSheetRequest = {
      LaboratoryId: props.labId,
      TransactionId: props.wipRun.transactionId || '',
      UploadedFilePairs: uploadedFilePairs,
    };
    const response = await $api.uploads.getSampleSheetCsv(request);
    return response;
  }

  async function getUploadFilesManifest(files: FileDetails[]): Promise<FileUploadManifest> {
    const request: FileUploadRequest = {
      LaboratoryId: props.labId,
      TransactionId: props.wipRun.transactionId || '',
      Files: files.map((file) => ({ Name: file.name, Size: file.size })),
    };

    const response = await $api.uploads.getFileUploadManifest(request);

    return response;
  }

  function addUploadUrls(uploadManifest: FileUploadManifest) {
    for (const file of files.value) {
      const url = uploadManifest.Files.find((manifestFile) => manifestFile.Name === file.name)?.S3Url;
      if (url) file.url = url;
    }
  }

  /**
   * Handles the process of uploading multiple files, tracks their progress, and manages upload results.
   *
   * @returns {Promise<UploadError[]>} - Resolves with an array of failed uploads (if any), containing error details.
   *
   * Purpose:
   * - Initiates the upload of all files in `filesNotUploaded` using `uploadFile`.
   * - Ensures that all file uploads are completed, regardless of individual successes or failures, using `Promise.allSettled`.
   * - Collects detailed information about any failed uploads, including user-friendly error messages.
   * - Displays meaningful toast notifications for both successful and failed uploads:
   *   - Displays a success toast when all files are uploaded successfully.
   *   - Displays specific error messages for network errors or generic messages for multiple failed files.
   * - Creates and submits a lab run request upon successful uploads.
   *
   * Toast Messaging:
   * - For network errors, displays a detailed user-friendly message.
   * - For other failures, displays specific error messages for individual files or a summary for multiple failed files.
   */
  async function uploadFiles(): Promise<UploadError[]> {
    try {
      const uploadPromises = Object.values(filesNotUploaded.value).map((fileDetails) =>
        uploadFile(fileDetails)
          .then(() => null)
          .catch((error) => ({
            fileName: fileDetails.fileName,
            error: error.message,
          })),
      );

      const results = await Promise.allSettled(uploadPromises);
      const errors = results
        .map((result) => (result.status === 'rejected' ? result.reason : result.value))
        .filter((error): error is UploadError => error !== null);

      // Show network error toast only once if any file failed due to network
      if (errors.some((error) => error.error === 'Network connection lost')) {
        toastStore.error('Network error - please check your connection and try again');
      }
      // Show other error toasts as needed
      else if (errors.length > 0) {
        if (errors.length === 1) {
          toastStore.error(`Upload failed for ${errors[0].fileName}`);
        } else {
          toastStore.error(`Upload failed for ${errors.length} files`);
        }
      }

      return errors;
    } catch (error) {
      return [];
    }
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
   * - Tracks the progress of the file upload and updates progress in `fileDetails`.
   * - Handles network errors, rejecting with a detailed error message.
   * - Logs any upload errors to the console for debugging purposes.
   */

  async function uploadFile(fileDetails: FileDetails): Promise<void> {
    if (!fileDetails.url) {
      throw new Error('No upload URL provided');
    }

    const controller = new AbortController();
    // Store the controller
    uploadControllers.value[fileDetails.name] = controller;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, UPLOAD_TIMEOUT);

    // Check network connection before starting upload
    if (!isOnline.value) {
      clearTimeout(timeoutId);
      fileDetails.error = 'No internet connection available';
      throw new Error('No internet connection available');
    }

    // Watch for network drops
    const unwatch = watch(
      isOnline,
      (online) => {
        if (!online) {
          // Immediately abort the upload and show error
          fileDetails.error = 'Network connection lost. Upload aborted.';
          controller.abort();
          unwatch();
        }
      },
      { flush: 'sync' },
    );

    try {
      const response = await axios.put(fileDetails.url, fileDetails.file, {
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            fileDetails.progress = progress;
          }
        },
      });

      clearTimeout(timeoutId);
      unwatch();
      // Remove the controller after successful upload
      delete uploadControllers.value[fileDetails.name];
      return response.data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      unwatch();
      // Remove the controller after failed upload
      delete uploadControllers.value[fileDetails.name];

      if (error.name === 'AbortError' || error.message === 'Network Error' || !isOnline.value) {
        fileDetails.error = 'Network connection lost. Upload aborted.';
        // Remove toast from here
        throw new Error('Network connection lost');
      }

      fileDetails.error = 'Upload failed. Please try again.';
      // Keep this toast as it's specific to the file
      toastStore.error('Upload failed. Please try again.');
      throw new Error('Upload failed. Please try again.');
    }
  }

  // Cancel upload for a specific file
  const cancelUpload = (fileName: string) => {
    const controller = uploadControllers.value[fileName];
    if (controller) {
      controller.abort();
      delete uploadControllers.value[fileName];
    }
  };

  const retryUpload = async (fileSelector: { sampleId: string; fileName: string }) => {
    // find file by filename
    let fileToRetry: FileDetails | undefined = files.value.find((file) => file.name === fileSelector.fileName);

    if (!fileToRetry) {
      throw new Error(`no fileToRetry found with name '${fileSelector.fileName}'`);
    }

    clearErrorsFromFiles([fileToRetry]);
    initializeProgressForFiles([fileToRetry]);

    try {
      // pre-upload work - catch and handle errors in this step with applyErrorToFiles
      try {
        // Get fresh upload URL
        const manifest = await getUploadFilesManifest([fileToRetry]);
        const fileInfo = manifest.Files.find((f) => f.Name === fileToRetry!.name);
        if (!fileInfo) {
          throw new Error('file not found in manifest');
        }

        fileToRetry.url = fileInfo.S3Url;
      } catch (error: any) {
        applyErrorToFiles([fileToRetry], error.message);
        throw error;
      }

      await uploadFile(fileToRetry);

      await postUploadHook();
    } catch (error: any) {
      toastStore.error(`Failed to retry upload`);
    }
  };

  const removeFile = (file: { sampleId: string; fileName: string }) => {
    // Find the file pair containing the file
    const filePair = filePairs.value.find((pair) => pair.sampleId === file.sampleId);

    if (filePair) {
      // Remove only the specific file (r1 or r2) that matches the filename
      if (filePair.r1File?.name === file.fileName) {
        filePair.r1File = undefined;
      } else if (filePair.r2File?.name === file.fileName) {
        filePair.r2File = undefined;
      }

      // If both files are now undefined, remove the entire pair
      if (!filePair.r1File && !filePair.r2File) {
        props.wipRun.files = filePairs.value.filter((pair) => pair.sampleId !== file.sampleId);
      }
    }
  };

  const canRetryUpload = (row: { sampleId: string; fileName: string; progress: number; error?: string }) => {
    // If the file isn't in error state, can't retry
    if (!row.error) return false;

    // Find the matching pair for this file
    const isPairedFile = filePairs.value.some((pair) => {
      const isR1 = pair.r1File?.name === row.fileName;
      const isR2 = pair.r2File?.name === row.fileName;

      // If this is R1, check if R2 exists
      if (isR1) return !!pair.r2File;
      // If this is R2, check if R1 exists
      if (isR2) return !!pair.r1File;

      return false;
    });

    return isPairedFile && isOnline.value;
  };

  watch(canProceedToNextStep, (val) => {
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
    <div
      class="py-4"
      @drop.prevent="handleDroppedFiles"
      :class="{ 'pointer-events-none opacity-50': !isDropzoneEnabled }"
    >
      <div
        id="dropzone"
        @dragenter.prevent="setDropzoneActive(true)"
        @dragleave.prevent="setDropzoneActive(false)"
        @dragover.prevent
        @drop.prevent="setDropzoneActive(false)"
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
              :disabled="!isDropzoneEnabled"
              :class="cn('visible ml-4', { 'invisible': isDropzoneActive })"
              @click="chooseFiles"
              label="Choose Files"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="files-list mb-6" v-if="filesForTable.length > 0">
      <div class="files-list-header text-body mb-4 border-b border-[#d9d9d9]">
        <div class="file-cell sample-id w-[30%]">Sample ID</div>
        <div class="file-cell w-[60%]">Sample File</div>
        <div class="file-cell w-[10%]"></div>
      </div>
      <div class="files-list-body">
        <div
          v-for="(row, index) in filesForTable"
          :key="row.fileName"
          class="file-row"
          :style="{
            background: row.error
              ? '#FFF2F0'
              : row.progress === 100
                ? '#E2FBE8'
                : row.progress !== undefined && row.progress > 0
                  ? `linear-gradient(to right, #E2FBE8 ${row.progress}%, transparent ${Math.min(row.progress + 10, 100)}%), #f7f7f7`
                  : '#f7f7f7',
          }"
        >
          <div class="file-cell sample-id text-body w-[30%]">
            <span v-if="!row.error">{{ row.sampleId }}</span>
            <span v-else class="text-alert-danger-dark mr-1 font-medium">(Upload Failed)</span>
          </div>
          <div
            class="file-cell flex w-[60%] items-center"
            :style="{ color: row.progress === 100 && !row.error ? '#306239' : 'inherit' }"
          >
            <template v-if="row.error">
              <Icon name="i-heroicons-exclamation-triangle" class="text-alert-danger-dark mr-2" size="20" />
            </template>
            {{ row.fileName }}
          </div>
          <div class="file-cell flex w-[10%] items-center justify-end gap-2">
            <template v-if="row.error">
              <button
                class="mr-2"
                :class="[
                  canRetryUpload(row) ? 'text-gray-900 hover:text-gray-700' : 'cursor-not-allowed text-gray-400',
                ]"
                @click="retryUpload(row)"
                :disabled="!isOnline || !canRetryUpload(row)"
              >
                <Icon name="i-heroicons-arrow-path" size="20" />
              </button>

              <button
                :disabled="!isOnline || uploadStatus === 'uploading'"
                :class="[
                  isOnline && uploadStatus !== 'uploading'
                    ? 'text-alert-danger hover:text-alert-danger-dark'
                    : 'cursor-not-allowed text-gray-400',
                ]"
                @click="removeFile(row)"
              >
                <Icon name="i-heroicons-trash" size="20" />
              </button>
            </template>
            <Icon v-else-if="row.progress === 100" size="20" name="i-heroicons-check" class="text-alert-success-text" />
            <button v-else class="text-gray-500 hover:text-gray-700" @click="cancelUpload(row.fileName)">
              <Icon name="i-heroicons-x" size="20" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <EGS3SampleSheetBar
      v-if="hasSampleSheetUrl"
      :disabled="uploadStatus === 'uploading'"
      :url="props.wipRun.sampleSheetS3Url"
      :lab-id="props.labId"
      :lab-name="props.labName"
      :pipeline-or-workflow-name="props.pipelineOrWorkflowName"
      :run-name="props.wipRun.runName"
    />

    <div class="flex justify-end pt-4">
      <EGButton
        v-if="hasSampleSheetUrl"
        variant="secondary"
        class="mr-2"
        label="Download sample sheet"
        @click="
          downloadSampleSheet(
            props.labId,
            props.wipRun.sampleSheetS3Url,
            props.pipelineOrWorkflowName,
            props.wipRun.runName,
          )
        "
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
      variant="primary"
      :label="filePairs.length ? 'Next step' : 'Skip'"
      @click="emit('next-step')"
      :disabled="!canProceedToNextStep"
    />
  </div>
</template>

<style lang="scss">
  .files-list {
    padding: 0;

    &-header {
      display: flex;
      padding: 12px 16px;
      font-size: 14px;

      .header-cell {
        flex: 1;
        font-weight: 500;
      }
    }

    &-body {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .file-row {
        display: flex;
        padding: 14px 16px;
        border-radius: 6px;
        transition: background 0.3s ease-out;

        .file-cell {
          font-size: 14px;

          &.sample-id {
            font-weight: 500;
          }
        }
      }
    }
  }
</style>
