import type { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';

/** Folder names in a typed or stored S3 folder, skipping the empty and whitespace-only segments slashes leave. */
function folderNames(prefix: string): string[] {
  return prefix.split('/').filter((segment) => segment.trim().length > 0);
}

/** Absolute S3 prefix for a folder the user typed relative to `rootPrefix`, which ends in "/". */
export function buildSourcePrefix(rootPrefix: string, typedPrefix: string): string {
  if (folderNames(typedPrefix).length === 0) return rootPrefix;
  const relativeFolder = typedPrefix.replace(/^\/*/, '');
  return relativeFolder.endsWith('/') ? `${rootPrefix}${relativeFolder}` : `${rootPrefix}${relativeFolder}/`;
}

/** Absolute S3 prefix for a folder the user typed relative to the laboratory's own folder. */
export function buildLaboratorySourcePrefix(
  laboratory: Pick<Laboratory, 'OrganizationId' | 'LaboratoryId'>,
  typedPrefix: string,
): string {
  return buildSourcePrefix(`${laboratory.OrganizationId}/${laboratory.LaboratoryId}/`, typedPrefix);
}

/**
 * True when the S3 source step still needs a folder typed. A blank folder in this lab's own folder would list the
 * whole lab, earlier imports included; a blank folder in an allowed folder lists just that folder.
 */
export function isSourceFolderMissing(typedPrefix: string, selectedAllowedFolder: string): boolean {
  return !selectedAllowedFolder && folderNames(typedPrefix).length === 0;
}

/** Default import label: the typed folder's name, else the selected allowed folder's name, else the bucket name. */
export function defaultS3ImportLabel(typedPrefix: string, selectedAllowedFolder: string, bucket: string): string {
  return folderNames(typedPrefix).pop() || folderNames(selectedAllowedFolder).pop() || bucket || 'import';
}
