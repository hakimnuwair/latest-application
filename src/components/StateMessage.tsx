import type { ReactNode } from 'react';
import { Button } from './Button';
import { BoxIcon } from './icons';

interface Props {
  title: string;
  message?: string | undefined;
  action?: ReactNode;
}

/** One layout for "nothing here", "not found" and "could not load", so they all feel the same. */
export function StateMessage({ title, message, action }: Props) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-16 text-center">
      <BoxIcon width={44} height={44} className="text-muted/70" />
      <h2 className="font-display text-3xl">{title}</h2>
      {message ? <p className="text-muted">{message}</p> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

export function RetryButton({ onClick }: { onClick: () => void }) {
  return <Button onClick={onClick}>Try again</Button>;
}
