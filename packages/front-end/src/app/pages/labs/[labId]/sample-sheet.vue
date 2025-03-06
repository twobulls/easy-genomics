<script setup lang="ts">
  interface TableData {
    headers: string[];
    data: string[][];
    metadata: {
      labName: string;
      pipelineOrWorkflowName: string;
      runName: string;
    };
  }

  definePageMeta({ layout: 'sample-sheet' });

  const { $api } = useNuxtApp();
  const route = useRoute();

  const labsStore = useLabsStore();

  const labId = route.params.labId as string;
  const labName = computed<string>(() => {
    const lab = labsStore.labs[labId];

    if (!lab) throw new Error(`no lab found for id ${labId}`);

    return lab.Name;
  });

  const tableData = ref<TableData | null>(null);

  onMounted(async () => {
    try {
      const { url, pipelineOrWorkflowName, runName } = route.query;

      if (!labId || !url) {
        throw new Error('Missing required parameters');
      }

      const fileDownloadUrlResponse = await $api.file.requestFileDownloadUrl({
        LaboratoryId: labId,
        S3Uri: url as string,
      });
      const content = await (await fetch(fileDownloadUrlResponse.DownloadUrl)).text();

      if (!content) {
        throw new Error('No content received');
      }

      const rows = content
        .trim()
        .split('\n')
        .map((line) => line.split(',').map((cell) => cell.trim()));

      const [headers, ...data] = rows;

      tableData.value = {
        headers,
        data,
        metadata: {
          labName: labName.value,
          pipelineOrWorkflowName: pipelineOrWorkflowName as string,
          runName: runName as string,
        },
      };
    } catch (error) {
      console.error('Error:', error);
    }
  });
</script>

<template>
  <div class="sample-sheet">
    <template v-if="tableData">
      <EGText tag="h3" class="mb-4">Sample Sheet</EGText>
      <div class="mb-8 space-y-1">
        <EGText tag="p">
          <strong>Run name:</strong>
          {{ tableData.metadata.runName }}
        </EGText>
        <EGText tag="p">
          <strong>Pipeline:</strong>
          {{ tableData.metadata.pipelineOrWorkflowName }}
        </EGText>
        <EGText tag="p">
          <strong>Laboratory:</strong>
          {{ tableData.metadata.labName }}
        </EGText>
      </div>
      <table>
        <thead>
          <tr>
            <th v-for="header in tableData.headers" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in tableData.data" :key="index">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
  .sample-sheet {
    padding: 32px;
  }

  table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 0 0 1px #e5e5e5;
    font-size: 14px;
  }

  th,
  td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #e5e5e5;
  }

  th,
  tr td:first-child {
    background: #f7f7f7;
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr td:not(:last-child),
  tr th:not(:last-child) {
    border-right: 1px solid #e5e5e5;
  }

  td {
    background: white;
  }
</style>
