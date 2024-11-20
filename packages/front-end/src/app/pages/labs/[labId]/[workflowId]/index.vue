<script setup lang="ts">
  import { EGTabsStyles } from '@FE/styles/nuxtui/UTabs';
  import { getDate, getTime } from '@FE/utils/date-time';
  import { Workflow } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';

  const { $api } = useNuxtApp();
  const $router = useRouter();
  const $route = useRoute();

  const workflowStore = useWorkflowStore();

  const labId = $route.params.labId as string;
  const workflowId = $route.params.workflowId as string;
  const workflowReports = ref([]);

  let workflowBasePath = '';
  let tabIndex = ref(0);

  // check permissions to be on this page
  if (!useUserStore().canViewLab(labId)) {
    $router.push('/labs');
  }

  const s3Prefix = computed(() => `${useUserStore().currentOrgId}/${labId}/next-flow`);
  const tabItems = computed(() => [
    {
      key: 'runDetails',
      label: 'Run Details',
    },
    {
      key: 'runResults',
      label: 'Run Results',
    },
  ]);
  const workflow = computed<Workflow | null>(() => workflowStore.workflows[labId][workflowId]);

  const s3JsonData = ref({
    '$metadata': {
      'httpStatusCode': 200,
      'requestId': 'MXXMJC9D8PPBZT74',
      'extendedRequestId': 'I+sqJO9tuByzltSfoSp8wZGgmq/aW9g7nMQrrTs7IxnYq7+VnWVvakDCrSdD6oo2UQlbXyNpsEU=',
      'attempts': 1,
      'totalRetryDelay': 0,
    },
    'Contents': [
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/GOL2051A55857_S103_L002_R1_001.fastq.gz',
        'LastModified': '2024-11-08T02:40:30.000Z',
        'ETag': '"725965805ad14d924d21f8c850c472c5"',
        'Size': 434858,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/GOL2051A55857_S103_L002_R2_001.fastq.gz',
        'LastModified': '2024-11-08T02:40:30.000Z',
        'ETag': '"725965805ad14d924d21f8c850c472c5"',
        'Size': 434858,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/results/pipeline_info/',
        'LastModified': '2024-11-08T02:48:53.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/results/pipeline_info/execution_report_2024-11-08_02-43-12.html',
        'LastModified': '2024-11-08T02:48:54.000Z',
        'ETag': '"14edb6d9d7f75e8af7e2bd8d49887e62"',
        'Size': 2942853,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/results/pipeline_info/execution_trace_2024-11-08_02-43-12.txt',
        'LastModified': '2024-11-08T02:48:52.000Z',
        'ETag': '"31bd02513cffaf6dad9c37b350754dd2"',
        'Size': 969,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/results/pipeline_info/pipeline_dag_2024-11-08_02-43-12.html',
        'LastModified': '2024-11-08T02:48:54.000Z',
        'ETag': '"70f4542a22eaaa7812e45349ab8f34f5"',
        'Size': 1908,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/results/pipeline_info/samplesheet.valid.csv',
        'LastModified': '2024-11-08T02:45:44.000Z',
        'ETag': '"5261d69c750f3b7cefcf3fa9e7ebcad0"',
        'Size': 473,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/sample-sheet.csv',
        'LastModified': '2024-11-08T02:40:33.000Z',
        'ETag': '"3b57178f3173707991d029f46335607d"',
        'Size': 454,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/',
        'LastModified': '2024-11-08T02:43:20.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/',
        'LastModified': '2024-11-08T02:45:45.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/.command.begin',
        'LastModified': '2024-11-08T02:47:45.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/.command.err',
        'LastModified': '2024-11-08T02:47:46.000Z',
        'ETag': '"af72c3c63260a34afc78c4355ff8da46"',
        'Size': 1416,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/.command.log',
        'LastModified': '2024-11-08T02:47:46.000Z',
        'ETag': '"af72c3c63260a34afc78c4355ff8da46"',
        'Size': 1416,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/.command.out',
        'LastModified': '2024-11-08T02:47:46.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/.command.run',
        'LastModified': '2024-11-08T02:45:45.000Z',
        'ETag': '"5b56ffde3bc8f82089de5c5246964629"',
        'Size': 12172,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/.command.sh',
        'LastModified': '2024-11-08T02:45:45.000Z',
        'ETag': '"a6be3a06a735073b73dbb89f7ef2b7bf"',
        'Size': 516,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/.command.trace',
        'LastModified': '2024-11-08T02:47:46.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/.exitcode',
        'LastModified': '2024-11-08T02:47:46.000Z',
        'ETag': '"c4ca4238a0b923820dcc509a6f75849b"',
        'Size': 1,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/.fusion.log',
        'LastModified': '2024-11-08T02:47:48.000Z',
        'ETag': '"02016531cf1e47b63921e52219a4d03d"',
        'Size': 65402,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/.fusion.symlinks',
        'LastModified': '2024-11-08T02:47:47.000Z',
        'ETag': '"07e1206b1ec3a66a242db3c11db64bfd"',
        'Size': 143,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/GOL2051A55857_S103_L002_R1_001.fastq.gz',
        'LastModified': '2024-11-08T02:47:47.000Z',
        'ETag': '"90b62004d68d61b2db165f8d1100e46a"',
        'Size': 207,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/GOL2051A55857_S103_L002_R2_001.fastq.gz',
        'LastModified': '2024-11-08T02:47:47.000Z',
        'ETag': '"a182f3b66c3f0ff01bb611dedc213341"',
        'Size': 207,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/GOL2051A55857_S103_L002_T1_1.gz',
        'LastModified': '2024-11-08T02:47:47.000Z',
        'ETag': '"d99d81fa9ecb097cab0cc03274e882eb"',
        'Size': 39,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/4d8c9a916d680ef7a13b0b171ec07a/GOL2051A55857_S103_L002_T1_2.gz',
        'LastModified': '2024-11-08T02:47:46.000Z',
        'ETag': '"a07c56a1c1599d4d64526bbf9431418c"',
        'Size': 39,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/',
        'LastModified': '2024-11-08T02:47:52.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/.command.begin',
        'LastModified': '2024-11-08T02:48:01.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/.command.err',
        'LastModified': '2024-11-08T02:48:02.000Z',
        'ETag': '"af72c3c63260a34afc78c4355ff8da46"',
        'Size': 1416,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/.command.log',
        'LastModified': '2024-11-08T02:48:02.000Z',
        'ETag': '"af72c3c63260a34afc78c4355ff8da46"',
        'Size': 1416,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/.command.out',
        'LastModified': '2024-11-08T02:48:01.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/.command.run',
        'LastModified': '2024-11-08T02:47:53.000Z',
        'ETag': '"b8fe21e0c18a22b20ed5893724dddef7"',
        'Size': 12172,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/.command.sh',
        'LastModified': '2024-11-08T02:47:53.000Z',
        'ETag': '"a6be3a06a735073b73dbb89f7ef2b7bf"',
        'Size': 516,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/.command.trace',
        'LastModified': '2024-11-08T02:48:01.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/.exitcode',
        'LastModified': '2024-11-08T02:48:02.000Z',
        'ETag': '"c4ca4238a0b923820dcc509a6f75849b"',
        'Size': 1,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/.fusion.log',
        'LastModified': '2024-11-08T02:48:03.000Z',
        'ETag': '"1c1978f5828d10c3b70ec38cef996b83"',
        'Size': 65409,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/.fusion.symlinks',
        'LastModified': '2024-11-08T02:48:03.000Z',
        'ETag': '"60d101f6b8296d7c4621b9ca0ffd33dd"',
        'Size': 143,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/GOL2051A55857_S103_L002_R1_001.fastq.gz',
        'LastModified': '2024-11-08T02:48:02.000Z',
        'ETag': '"90b62004d68d61b2db165f8d1100e46a"',
        'Size': 207,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/GOL2051A55857_S103_L002_R2_001.fastq.gz',
        'LastModified': '2024-11-08T02:48:02.000Z',
        'ETag': '"a182f3b66c3f0ff01bb611dedc213341"',
        'Size': 207,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/GOL2051A55857_S103_L002_T1_1.gz',
        'LastModified': '2024-11-08T02:48:02.000Z',
        'ETag': '"d99d81fa9ecb097cab0cc03274e882eb"',
        'Size': 39,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/95/b4470c17a438201cd9d9c63103f8b0/GOL2051A55857_S103_L002_T1_2.gz',
        'LastModified': '2024-11-08T02:48:02.000Z',
        'ETag': '"a07c56a1c1599d4d64526bbf9431418c"',
        'Size': 39,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/',
        'LastModified': '2024-11-08T02:48:11.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/.command.begin',
        'LastModified': '2024-11-08T02:48:22.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/.command.err',
        'LastModified': '2024-11-08T02:48:23.000Z',
        'ETag': '"af72c3c63260a34afc78c4355ff8da46"',
        'Size': 1416,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/.command.log',
        'LastModified': '2024-11-08T02:48:23.000Z',
        'ETag': '"af72c3c63260a34afc78c4355ff8da46"',
        'Size': 1416,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/.command.out',
        'LastModified': '2024-11-08T02:48:22.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/.command.run',
        'LastModified': '2024-11-08T02:48:11.000Z',
        'ETag': '"a1f5426c9ade0c365e40ff0e840363a5"',
        'Size': 12172,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/.command.sh',
        'LastModified': '2024-11-08T02:48:12.000Z',
        'ETag': '"a6be3a06a735073b73dbb89f7ef2b7bf"',
        'Size': 516,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/.command.trace',
        'LastModified': '2024-11-08T02:48:22.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/.exitcode',
        'LastModified': '2024-11-08T02:48:23.000Z',
        'ETag': '"c4ca4238a0b923820dcc509a6f75849b"',
        'Size': 1,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/.fusion.log',
        'LastModified': '2024-11-08T02:48:24.000Z',
        'ETag': '"1061af5d73a136bbc1286a50d7f45dc5"',
        'Size': 65402,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/.fusion.symlinks',
        'LastModified': '2024-11-08T02:48:24.000Z',
        'ETag': '"286c478b0b78214fb7af618295f5d39a"',
        'Size': 143,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/GOL2051A55857_S103_L002_R1_001.fastq.gz',
        'LastModified': '2024-11-08T02:48:24.000Z',
        'ETag': '"90b62004d68d61b2db165f8d1100e46a"',
        'Size': 207,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/GOL2051A55857_S103_L002_R2_001.fastq.gz',
        'LastModified': '2024-11-08T02:48:23.000Z',
        'ETag': '"a182f3b66c3f0ff01bb611dedc213341"',
        'Size': 207,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/GOL2051A55857_S103_L002_T1_1.gz',
        'LastModified': '2024-11-08T02:48:23.000Z',
        'ETag': '"d99d81fa9ecb097cab0cc03274e882eb"',
        'Size': 39,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/9d/fdb4c559f82ad62e0ac970465ad7bf/GOL2051A55857_S103_L002_T1_2.gz',
        'LastModified': '2024-11-08T02:48:24.000Z',
        'ETag': '"a07c56a1c1599d4d64526bbf9431418c"',
        'Size': 39,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/collect-file/',
        'LastModified': '2024-11-08T02:48:52.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/collect-file/05eaff0ab52b0730607bad283038e4a9',
        'LastModified': '2024-11-08T02:43:35.000Z',
        'ETag': '"6a325195838654deeea60d8c685c671e"',
        'Size': 258,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/collect-file/c962034ea55366f989a235043ca99539',
        'LastModified': '2024-11-08T02:43:35.000Z',
        'ETag': '"07ccf95de71013257902afdc34e15026"',
        'Size': 255,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/collect-file/ff4fc95d85944ccad9a7b5ea8187a6cc',
        'LastModified': '2024-11-08T02:48:52.000Z',
        'ETag': '"c628014134153cba96c2ada213f72c3a"',
        'Size': 251,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/',
        'LastModified': '2024-11-08T02:48:31.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/.command.begin',
        'LastModified': '2024-11-08T02:48:43.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/.command.err',
        'LastModified': '2024-11-08T02:48:44.000Z',
        'ETag': '"af72c3c63260a34afc78c4355ff8da46"',
        'Size': 1416,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/.command.log',
        'LastModified': '2024-11-08T02:48:44.000Z',
        'ETag': '"af72c3c63260a34afc78c4355ff8da46"',
        'Size': 1416,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/.command.out',
        'LastModified': '2024-11-08T02:48:51.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/.command.run',
        'LastModified': '2024-11-08T02:48:32.000Z',
        'ETag': '"29f3d261c0612e51af7d0abf30b23f75"',
        'Size': 12172,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/.command.sh',
        'LastModified': '2024-11-08T02:48:32.000Z',
        'ETag': '"a6be3a06a735073b73dbb89f7ef2b7bf"',
        'Size': 516,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/.command.trace',
        'LastModified': '2024-11-08T02:48:44.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/.exitcode',
        'LastModified': '2024-11-08T02:48:44.000Z',
        'ETag': '"c4ca4238a0b923820dcc509a6f75849b"',
        'Size': 1,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/.fusion.log',
        'LastModified': '2024-11-08T02:48:45.000Z',
        'ETag': '"f8843e5a557daf30bb2801ff9c5f5acb"',
        'Size': 65403,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/.fusion.symlinks',
        'LastModified': '2024-11-08T02:48:45.000Z',
        'ETag': '"7a5b77df21b1e60630742c035623d3a8"',
        'Size': 143,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/GOL2051A55857_S103_L002_R1_001.fastq.gz',
        'LastModified': '2024-11-08T02:48:45.000Z',
        'ETag': '"90b62004d68d61b2db165f8d1100e46a"',
        'Size': 207,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/GOL2051A55857_S103_L002_R2_001.fastq.gz',
        'LastModified': '2024-11-08T02:48:45.000Z',
        'ETag': '"a182f3b66c3f0ff01bb611dedc213341"',
        'Size': 207,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/GOL2051A55857_S103_L002_T1_1.gz',
        'LastModified': '2024-11-08T02:48:44.000Z',
        'ETag': '"d99d81fa9ecb097cab0cc03274e882eb"',
        'Size': 39,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/de/8899a3401c98a19776749001f2f621/GOL2051A55857_S103_L002_T1_2.gz',
        'LastModified': '2024-11-08T02:48:45.000Z',
        'ETag': '"a07c56a1c1599d4d64526bbf9431418c"',
        'Size': 39,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/fa/529cb139cc55a4335ff56de7639ea0/',
        'LastModified': '2024-11-08T02:43:38.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/fa/529cb139cc55a4335ff56de7639ea0/.command.begin',
        'LastModified': '2024-11-08T02:45:36.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/fa/529cb139cc55a4335ff56de7639ea0/.command.err',
        'LastModified': '2024-11-08T02:45:36.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/fa/529cb139cc55a4335ff56de7639ea0/.command.log',
        'LastModified': '2024-11-08T02:45:35.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/fa/529cb139cc55a4335ff56de7639ea0/.command.out',
        'LastModified': '2024-11-08T02:45:36.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/fa/529cb139cc55a4335ff56de7639ea0/.command.run',
        'LastModified': '2024-11-08T02:43:38.000Z',
        'ETag': '"6112f4486728659b6ecf0abe86d6dd19"',
        'Size': 11789,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/fa/529cb139cc55a4335ff56de7639ea0/.command.sh',
        'LastModified': '2024-11-08T02:43:38.000Z',
        'ETag': '"0a22781a1a8215a638e6eb6056df607e"',
        'Size': 259,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/fa/529cb139cc55a4335ff56de7639ea0/.command.trace',
        'LastModified': '2024-11-08T02:45:38.000Z',
        'ETag': '"a60dbc58d9b9510bdd5aa826596ec484"',
        'Size': 248,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/fa/529cb139cc55a4335ff56de7639ea0/.exitcode',
        'LastModified': '2024-11-08T02:45:38.000Z',
        'ETag': '"cfcd208495d565ef66e7dff9f98764da"',
        'Size': 1,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/fa/529cb139cc55a4335ff56de7639ea0/.fusion.log',
        'LastModified': '2024-11-08T02:45:39.000Z',
        'ETag': '"821f4fee899d6e1799b25fd9a745380b"',
        'Size': 85262,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/fa/529cb139cc55a4335ff56de7639ea0/sample-sheet.csv',
        'LastModified': '2024-11-08T02:45:38.000Z',
        'ETag': '"3b57178f3173707991d029f46335607d"',
        'Size': 454,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/fa/529cb139cc55a4335ff56de7639ea0/samplesheet.valid.csv',
        'LastModified': '2024-11-08T02:45:38.000Z',
        'ETag': '"5261d69c750f3b7cefcf3fa9e7ebcad0"',
        'Size': 473,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/fa/529cb139cc55a4335ff56de7639ea0/versions.yml',
        'LastModified': '2024-11-08T02:45:38.000Z',
        'ETag': '"b5bd8c9bfbb1a95f69475be8ce71f0ce"',
        'Size': 77,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/nf-I27l1uKoGa2zy-reports.tsv',
        'LastModified': '2024-11-08T02:49:42.000Z',
        'ETag': '"e712dccc553c0338ac3f2569d1e03b32"',
        'Size': 32,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/nf-I27l1uKoGa2zy.log',
        'LastModified': '2024-11-08T02:49:40.000Z',
        'ETag': '"49d6c507a5d5c94160ed28016e831b40"',
        'Size': 48732,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/nf-I27l1uKoGa2zy.txt',
        'LastModified': '2024-11-08T02:49:40.000Z',
        'ETag': '"6e30ff938e3d78a745d105c4e4b9e20f"',
        'Size': 6121,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/timeline-I27l1uKoGa2zy.html',
        'LastModified': '2024-11-08T02:49:41.000Z',
        'ETag': '"76049f72779fec9031d63280fb51972e"',
        'Size': 252936,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/tmp/2a/8b28ff9a076c20dd6f5e400c8d51d8/',
        'LastModified': '2024-11-08T02:43:32.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/tmp/2a/8b28ff9a076c20dd6f5e400c8d51d8/workflow_summary_mqc.yaml',
        'LastModified': '2024-11-08T02:43:35.000Z',
        'ETag': '"9ac8206a560532fdc77586493ab894db"',
        'Size': 1887,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/tmp/7e/4eb7e44358326d910ba365f9393923/',
        'LastModified': '2024-11-08T02:43:32.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/tmp/7e/4eb7e44358326d910ba365f9393923/methods_description_mqc.yaml',
        'LastModified': '2024-11-08T02:43:35.000Z',
        'ETag': '"08aaacdaea58133687512cb972a267b5"',
        'Size': 3914,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/tmp/bc/fa2bc58ef1a94bcaf7f097de519ebf/',
        'LastModified': '2024-11-08T02:43:32.000Z',
        'ETag': '"d41d8cd98f00b204e9800998ecf8427e"',
        'Size': 0,
        'StorageClass': 'STANDARD',
      },
      {
        'Key':
          '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2/work/tmp/bc/fa2bc58ef1a94bcaf7f097de519ebf/collated_versions.yml',
        'LastModified': '2024-11-08T02:48:52.000Z',
        'ETag': '"b5bd8c9bfbb1a95f69475be8ce71f0ce"',
        'Size': 77,
        'StorageClass': 'STANDARD',
      },
    ],
    'IsTruncated': false,
    'KeyCount': 96,
    'MaxKeys': 1000,
    'Name': '851725267090-dev-quality-lab-bucket',
    'Prefix':
      '61c86013-74f2-4d30-916a-70b03a97ba14/2c7be90f-6db9-442f-a7ec-5b15bab0229f/next-flow/4c985899-fcbd-4a51-bc4b-5b0e3fb5e7a2',
  });

  const createdDateTime = computed(() => {
    const createdDate = getDate(workflow.value?.dateCreated);
    const createdTime = getTime(workflow.value?.dateCreated);
    return createdDate && createdTime ? `${createdTime} ⋅ ${createdDate}` : '—';
  });
  const startedDateTime = computed(() => {
    const startedDate = getDate(workflow.value?.start);
    const startedTime = getTime(workflow.value?.start);
    return startedDate && startedTime ? `${startedTime} ⋅ ${startedDate}` : '—';
  });
  const stoppedDateTime = computed(() => {
    const stoppedDate = getDate(workflow.value?.complete);
    const stoppedTime = getTime(workflow.value?.complete);
    return stoppedDate && stoppedTime ? `${stoppedTime} ⋅ ${stoppedDate}` : '—';
  });

  async function loadWorkflowReports() {
    useUiStore().setRequestPending('loadWorkflowReports');
    const res = await $api.workflows.readWorkflowReports(workflowId, labId);
    workflowReports.value = res.reports;
    workflowBasePath = res.basePath;
    useUiStore().setRequestComplete('loadWorkflowReports');
  }

  async function fetchS3Content() {
    useUiStore().setRequestPending('fetchS3Content');
    try {
      const res = await $api.file.requestListBucketObjects({
        LaboratoryId: labId,
        S3Prefix: s3Prefix.value,
      });
      s3JsonData.value = res;
    } catch (error) {
      console.error('Error fetching S3 content', error);
    } finally {
      useUiStore().setRequestComplete('fetchS3Content');
    }
  }

  onBeforeMount(async () => {
    await loadWorkflowReports();
    // TODO: add API call to get Run ID to construct s3 prefix for fetchS3Content() - see: Andrew
    // await fetchS3Content();
  });

  // set tabIndex according to query param
  onMounted(() => {
    const queryTab = $route.query.tab as string;
    const queryTabMatchIndex = tabItems.value.findIndex((tab) => tab.label === queryTab);
    tabIndex.value = queryTabMatchIndex !== -1 ? queryTabMatchIndex : 0;
  });
</script>

<template>
  <EGPageHeader
    :title="workflow?.runName || ''"
    :description="workflow?.projectName || ''"
    :show-back="true"
    :back-action="() => $router.push(`/labs/${labId}`)"
    :is-loading="useUiStore().isRequestPending('loadWorkflow')"
    :skeleton-config="{ titleLines: 2, descriptionLines: 1 }"
  />

  <UTabs
    :ui="EGTabsStyles"
    :model-value="tabIndex"
    :items="tabItems"
    @update:model-value="
      (newIndex) => {
        $router.push({ query: { ...$router.currentRoute.query, tab: tabItems[newIndex].label } });
        tabIndex = newIndex;
      }
    "
  >
    <template #item="{ item }">
      <div v-if="item.key === 'runResults'" class="space-y-3">
        <EGFileExplorerer
          :json-data="s3JsonData"
          :lab-id="labId"
          :workflow-base-path="workflowBasePath"
          v-if="s3JsonData"
        />
        <div v-else>No run results available.</div>
      </div>
      <div v-if="item.key === 'runDetails'" class="space-y-3">
        <section
          class="stroke-light flex flex-col rounded-none rounded-b-2xl border border-solid bg-white p-6 pt-0 max-md:px-5"
        >
          <dl class="mt-4">
            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Workflow Run Status</dt>
              <dd class="text-muted text-left"><EGStatusChip :status="workflow?.status" /></dd>
            </div>
            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Creation Time</dt>
              <dd class="text-muted text-left">{{ createdDateTime }}</dd>
            </div>
            <div class="flex border-b p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Start Time</dt>
              <dd class="text-muted text-left max-md:max-w-full">{{ startedDateTime }}</dd>
            </div>
            <div class="flex p-4 text-sm">
              <dt class="w-[200px] font-medium text-black">Stop Time</dt>
              <dd class="text-muted text-left max-md:max-w-full">{{ stoppedDateTime }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </template>
  </UTabs>
</template>
