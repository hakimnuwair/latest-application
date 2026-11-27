/** Mirrors the server's rules so mistakes are caught before a long upload. The server still has the last word. */
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const;
export const ACCEPT = [...IMAGE_TYPES, ...VIDEO_TYPES].join(',');
export const MAX_FILE_MB = 50;
export const MAX_FILES_PER_REQUEST = 5;
export const MAX_FILES_PER_PRODUCT = 10;

const isAllowedType = (type: string): boolean =>
  (IMAGE_TYPES as readonly string[]).includes(type) ||
  (VIDEO_TYPES as readonly string[]).includes(type);

/** Splits what the owner picked into files to upload and plain-language reasons for the ones refused. */
export const checkFiles = (
  files: File[],
  alreadyHave: number,
): { ok: File[]; problems: string[] } => {
  const ok: File[] = [];
  const problems: string[] = [];
  for (const file of files) {
    if (!isAllowedType(file.type)) {
      problems.push(
        `"${file.name}" is not a photo (JPG, PNG, WebP, AVIF) or video (MP4, WebM, MOV).`,
      );
    } else if (file.size > MAX_FILE_MB * 1024 * 1024) {
      problems.push(`"${file.name}" is larger than ${MAX_FILE_MB} MB.`);
    } else if (alreadyHave + ok.length >= MAX_FILES_PER_PRODUCT) {
      problems.push(
        `"${file.name}" was skipped: a product can have at most ${MAX_FILES_PER_PRODUCT} photos and videos.`,
      );
    } else {
      ok.push(file);
    }
  }
  return { ok, problems };
};

/** Groups files into requests of at most 5. */
export const inBatches = (files: File[]): File[][] => {
  const batches: File[][] = [];
  for (let i = 0; i < files.length; i += MAX_FILES_PER_REQUEST)
    batches.push(files.slice(i, i + MAX_FILES_PER_REQUEST));
  return batches;
};
