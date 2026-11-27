import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  /** The main button of the page (for example "Add product"). */
  action?: ReactNode;
  /** A small link above the title (for example "All products"). */
  back?: ReactNode;
}

export function PageHeader({ title, description, action, back }: Props) {
  return (
    <div className="mb-5 space-y-1">
      {back}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">{title}</h1>
          {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
