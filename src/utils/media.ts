import type { PublicMedia } from '../api/public';

/**
 * Cloudinary can resize and re-compress on the fly by adding a few letters to the URL. This keeps phones from
 * downloading huge originals. Any URL that is not a Cloudinary upload URL is used as it is.
 */
const CLOUDINARY = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/)(image|video)\/upload\/(.+)$/;

export const imageUrl = (url: string, width: number): string => {
  const m = CLOUDINARY.exec(url);
  if (!m || m[2] !== 'image') return url;
  return `${m[1]}image/upload/f_auto,q_auto,c_limit,w_${width}/${m[3]}`;
};

export const imageSrcSet = (url: string, widths: number[]): string | undefined => {
  const m = CLOUDINARY.exec(url);
  if (!m || m[2] !== 'image') return undefined;
  return widths.map((w) => `${imageUrl(url, w)} ${w}w`).join(', ');
};

/** A still frame of a video, used as its thumbnail and as the player's poster. */
export const videoPoster = (url: string, width: number): string | undefined => {
  const m = CLOUDINARY.exec(url);
  if (!m || m[2] !== 'video') return undefined;
  const path = (m[3] ?? '').replace(/\.[a-z0-9]+$/i, '');
  return `${m[1]}video/upload/so_0,q_auto,c_limit,w_${width}/${path}.jpg`;
};

/** The picture shown for a product in lists: the first photo, else the first video's still frame. */
export const coverOf = (media: PublicMedia[]): PublicMedia | undefined =>
  media.find((m) => m.type === 'IMAGE') ?? media[0];
