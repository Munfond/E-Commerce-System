import { IMAGE_BASE_URL } from './config';

export function resolveImageUrl(filePath?: string | null, baseUrl: string = IMAGE_BASE_URL): string {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  return `${baseUrl}${filePath.replace(/^\//, '')}`;
}