/** The shop mark: a brass "L" on deep green. Same drawing as public/favicon.svg. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true" className="shrink-0">
      <rect width="512" height="512" rx="112" fill="#1f3a34" />
      <path
        transform="translate(161.30 421.00) scale(0.4583 -0.4583)"
        fill="#d9b36a"
        d="M34 0Q19 0 19 11Q19 20 32 23L55 27Q76 31 82.5 38.0Q89 45 89 66V654Q89 675 82.5 682.0Q76 689 55 693L32 697Q19 700 19 709Q19 720 34 720H217Q232 720 232 708Q232 699 221 697L194 693Q173 690 166.5 682.0Q160 674 160 653V93Q160 57 180.5 41.0Q201 25 232 25Q255 25 279.5 34.5Q304 44 324.0 70.5Q344 97 354 148L367 215Q370 228 382 228Q396 228 394 211L382 23Q380 0 357 0Z"
      />
    </svg>
  );
}
