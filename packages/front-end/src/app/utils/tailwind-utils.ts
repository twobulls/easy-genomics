/**
 * Code from open source project shadcn/ui
 * https://github.com/shadcn-ui/ui/blob/main/apps/www/lib/utils.ts
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind utility function to merge classes leveraging clsx and tailwind-merge packages.
 *
 * clsx:
 * Construct class strings conditionally with support for object syntax e.g.
 * { 'font-semibold ring-offset-2': isDropzoneActive }
 *
 * tailwind-merge:
 * Merge tailwind classes without conflicts. Also resolves overrides of classes with
 * different names e.g.
 * Override 'px-3 py-2' with 'p-4'
 *
 * This YouTube video explains the concept.
 * Title: cn() - Every Tailwind Coder Needs It (clsx + twMerge)
 * URL: https://youtu.be/re2JFITR7TI
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
