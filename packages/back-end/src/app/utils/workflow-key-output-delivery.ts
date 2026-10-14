import { matchKeyOutputPattern } from '@easy-genomics/shared-lib/src/app/utils/workflow-key-output-patterns';
import { normalizeS3Prefix } from '@BE/utils/s3-uri-utils';
import { toRunRelativePath } from '@BE/utils/workflow-key-output-utils';

export type KeyOutputDeliveryFile = {
  key: string;
  relativePath: string;
  size: number;
};

export function filesMatchingKeyOutputs(
  objects: Array<{ Key?: string; Size?: number }>,
  rootPrefix: string,
  patterns: string[],
): KeyOutputDeliveryFile[] {
  const matches: KeyOutputDeliveryFile[] = [];
  const seen = new Set<string>();
  for (const object of objects) {
    const key = object.Key || '';
    const relativePath = toRunRelativePath(key, rootPrefix);
    if (!relativePath || seen.has(key)) continue;
    if (!patterns.some((pattern) => matchKeyOutputPattern(pattern, relativePath))) continue;
    seen.add(key);
    matches.push({ key, relativePath, size: object.Size || 0 });
  }
  return matches;
}

export function keyOutputDeliveryObjectKey(relativePath: string, destinationPrefix: string): string {
  return `${destinationPrefix}${relativePath}`;
}

/** True when the copy would land inside, or contain, the run output prefix. */
export function deliveryDestinationOverlapsSource(params: {
  sourceBucket: string;
  sourcePrefix: string;
  destinationBucket: string;
  destinationPrefix: string;
}): boolean {
  if (params.sourceBucket !== params.destinationBucket) return false;
  const source = normalizeS3Prefix(params.sourcePrefix);
  const destination = params.destinationPrefix ? normalizeS3Prefix(params.destinationPrefix) : '';
  if (!destination) return false;
  return destination.startsWith(source) || source.startsWith(destination);
}
