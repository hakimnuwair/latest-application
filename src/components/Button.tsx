import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const styles: Record<Variant, string> = {
  primary: 'bg-oud text-white hover:bg-oud/90 disabled:bg-muted/50',
  secondary: 'border border-line bg-white text-ink hover:bg-oud-soft disabled:text-muted/50',
  danger: 'bg-red-700 text-white hover:bg-red-800 disabled:bg-muted/50',
  ghost: 'text-ink hover:bg-oud-soft disabled:text-muted/50',
};

/** 44px minimum height: comfortable to tap with a thumb. */
export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-base font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oud disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}
