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
  import { useToastStore } from '@FE/stores';
  import usePipeline from '@FE/composables/usePipeline';
  import { WipSeqeraRunData } from '@FE/stores/run';
  import { useNetwork } from '@vueuse/core';

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
  const { downloadSampleSheet } = usePipeline($api);
  const toastStore = useToastStore();

  const emit = defineEmits(['next-step', 'previous-step', 'step-validated']);
  const props = defineProps<{
    labId: string;
    sampleSheetS3Url: string;
    pipelineOrWorkflowName: string;
    runName: string;
    transactionId: string;
    wipRunUpdateFunction: Function;
    wipRunTempId: string;
  }>();

  const chooseFilesButton = ref<HTMLButtonElement | null>(null);

  const filesToUpload = ref<FileDetails[]>([]);
  const filePairs = ref<FilePair[]>([]);

  const canUploadFiles = ref(false);
  const canProceed = ref(false);
  const isDropzoneActive = ref(false);

  // overall upload status for all files
  const uploadStatus = ref<UploadStatus>('idle');

  const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
  const MIN_FILE_SIZE = 1; // 1byte

  const filesForTable = computed(() => {
    const files: { sampleId: string; fileName: string; progress: number; error?: string }[] = [];

    filePairs.value.forEach((filePair: FilePair) => {
      if (filePair.r1File) {
        files.push({
          sampleId: filePair.sampleId,
          fileName: filePair.r1File.name,
          progress: filePair.r1File.percentage || 0,
          error: filePair.r1File.error,
        });
      }
      if (filePair.r2File) {
        files.push({
          sampleId: filePair.sampleId,
          fileName: filePair.r2File.name,
          progress: filePair.r2File.percentage || 0,
          error: filePair.r2File.error,
        });
      }
    });

    return files;
  });

  const showDropzone = computed(() => !canProceed.value || uploadStatus.value === 'idle');

  const isUploadButtonDisabled = computed(
    () =>
      !canUploadFiles.value ||
      uploadStatus.value === 'uploading' ||
      uploadStatus.value === 'success' ||
      canProceed.value,
  );

  // Add a computed property to check if all files are successfully uploaded
  const areAllFilesUploaded = computed(() => {
    if (filePairs.value.length === 0) return false;

    for (const pair of filePairs.value) {
      // Check R1 file
      if (!pair.r1File || pair.r1File.error || pair.r1File.percentage !== 100) {
        return false;
      }
      // Check R2 file
      if (!pair.r2File || pair.r2File.error || pair.r2File.percentage !== 100) {
        return false;
      }
    }
    return true;
  });

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
      if (!filePair.r1File || !filePair.r2File) {
        haveMatchingFilePairs = false;
        break;
      }
    }

    canUploadFiles.value = haveMatchingFilePairs;
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
    filesToUpload.value.push(fileDetails);
    addFileToFilePairs(fileDetails);
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

  function toggleDropzoneActive() {
    isDropzoneActive.value = !isDropzoneActive.value;
  }

  async function startUploadProcess() {
    uploadStatus.value = 'uploading';

    const uploadManifest = await getUploadFilesManifest();
    addUploadUrls(uploadManifest);
    await uploadFiles();
    const uploadedFilePairs: UploadedFilePairInfo[] = getUploadedFilePairs(uploadManifest);
    const sampleSheetResponse: SampleSheetResponse = await getSampleSheetCsv(uploadedFilePairs);
    props.wipRunUpdateFunction(props.wipRunTempId, {
      sampleSheetS3Url: sampleSheetResponse.SampleSheetInfo.S3Url,
      s3Bucket: sampleSheetResponse.SampleSheetInfo.Bucket,
      s3Path: sampleSheetResponse.SampleSheetInfo.Path,
    });

    canProceed.value = areAllFilesUploaded.value;
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
      TransactionId: props.transactionId || '',
      UploadedFilePairs: uploadedFilePairs,
    };
    const response = await $api.uploads.getSampleSheetCsv(request);
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
      LaboratoryId: props.labId,
      TransactionId: props.transactionId || '',
      Files: files,
    };

    const response = await $api.uploads.getFileUploadManifest(request);

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

  // Track ongoing upload requests
  const uploadControllers = ref<{ [key: string]: AbortController }>({});

  const { isOnline } = useNetwork();

  // Network timeout in milliseconds (15 seconds)
  const UPLOAD_TIMEOUT = 600000; // 10 mins
  const UPLOAD_RETRY_DELAY = 3000; // 3 second delay helps prevent immediate retry spam and gives time for temporary network issues to resolve

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
   *   - Displays specific error messages for network errors or generic messages for multiple failed files.
   * - Creates and submits a lab run request upon successful uploads.
   *
   * Toast Messaging:
   * - For network errors, displays a detailed user-friendly message.
   * - For other failures, displays specific error messages for individual files or a summary for multiple failed files.
   */
  async function uploadFiles(): Promise<UploadError[]> {
    try {
      const uploadPromises = Object.values(filesToUpload.value).map((fileDetails) =>
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
        toastStore.error('Upload aborted: Network connection lost');
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
      console.error('Error in uploadFiles:', error);
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
   * - Tracks the progress of the file upload and updates progress/percentage in `fileDetails`.
   * - Handles network errors, rejecting with a detailed error message.
   * - Logs any upload errors to the console for debugging purposes.
   */

  async function uploadFile(fileDetails: FileDetails): Promise<void> {
    if (!fileDetails.url) {
      throw new Error('No upload URL provided');
    }

    const controller = new AbortController();
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
            fileDetails.percentage = progress;
          }
        },
      });

      clearTimeout(timeoutId);
      unwatch();
      return response.data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      unwatch();

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

  const retryUpload = async (file: { sampleId: string; fileName: string }) => {
    // Find the file in filePairs
    let fileToRetry: FileDetails | undefined;

    for (const pair of filePairs.value) {
      if (pair.r1File?.name === file.fileName) {
        pair.r1File.error = undefined;
        pair.r1File.percentage = 0;
        fileToRetry = pair.r1File;
        break;
      }
      if (pair.r2File?.name === file.fileName) {
        pair.r2File.error = undefined;
        pair.r2File.percentage = 0;
        fileToRetry = pair.r2File;
        break;
      }
    }

    if (fileToRetry) {
      try {
        // Get fresh upload URL
        const manifest = await getUploadFilesManifest();
        const fileInfo = manifest.Files.find((f) => f.Name === fileToRetry!.name);
        if (fileInfo) {
          fileToRetry.url = fileInfo.S3Url;
          await uploadFile(fileToRetry);
          // Update canProceed after successful retry
          canProceed.value = areAllFilesUploaded.value;
        }
      } catch (error: any) {
        toastStore.error(`Failed to retry upload`);
        canProceed.value = false;
      }
    }
  };

  const removeFile = (file: { sampleId: string; fileName: string }) => {
    // Remove the file from filePairs
    filePairs.value = filePairs.value.filter((pair) => {
      if (pair.r1File?.name === file.fileName || pair.r2File?.name === file.fileName) {
        return false;
      }
      return true;
    });
  };

  // Temporary method to simulate upload failure
  const simulateUploadFailure = () => {
    if (filePairs.value.length > 0) {
      // Set error on first file found
      if (filePairs.value[0].r1File) {
        const file = filePairs.value[0].r1File;
        cancelUpload(file.name); // Cancel any ongoing upload
        file.error = 'Simulated upload failure';
        file.percentage = 0;
        toastStore.error(`Failed to upload ${file.name}: Simulated upload failure`);
      } else if (filePairs.value[0].r2File) {
        const file = filePairs.value[0].r2File;
        cancelUpload(file.name); // Cancel any ongoing upload
        file.error = 'Simulated upload failure';
        file.percentage = 0;
        toastStore.error(`Failed to upload ${file.name}: Simulated upload failure`);
      }
      // Disable proceeding when there's a failure
      canProceed.value = false;
    }
  };

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

    <div class="files-list" v-if="filesForTable.length > 0">
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
                : row.progress > 0
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
            :style="{ color: row.progress === 100 ? '#306239' : 'inherit' }"
          >
            <template v-if="row.error">
              <UIcon name="i-heroicons-exclamation-triangle" class="text-alert-danger-dark mr-2" size="20" />
            </template>
            {{ row.fileName }}
          </div>
          <div class="file-cell flex w-[10%] items-center justify-end gap-2">
            <template v-if="row.error">
              <button
                class="mr-2"
                :class="[isOnline ? 'text-gray-900 hover:text-gray-700' : 'cursor-not-allowed text-gray-400']"
                @click="retryUpload(row)"
                :disabled="!isOnline.value"
                :title="isOnline.value ? 'Retry upload' : 'Cannot retry while offline'"
              >
                <UIcon name="i-heroicons-arrow-path" size="20" />
              </button>

              <button class="text-alert-danger hover:text-alert-danger/80" @click="removeFile(row)">
                <UIcon name="i-heroicons-trash" size="20" />
              </button>
            </template>
            <UIcon
              v-else-if="row.progress === 100"
              size="20"
              name="i-heroicons-check"
              class="text-alert-success-text"
            />
            <button v-else class="text-gray-500 hover:text-gray-700" @click="cancelUpload(row.fileName)">
              <UIcon name="i-heroicons-x" size="20" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-end pt-4">
      <!-- Temporary button for testing failures -->
      <EGButton
        v-if="filesForTable.length > 0"
        variant="secondary"
        class="mr-2"
        label="Test Failure"
        @click="simulateUploadFailure"
      />
      <EGButton
        v-if="uploadStatus === 'success'"
        variant="secondary"
        class="mr-2"
        label="Download sample sheet"
        @click="downloadSampleSheet(props.labId, props.sampleSheetS3Url, props.pipelineOrWorkflowName, props.runName)"
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
