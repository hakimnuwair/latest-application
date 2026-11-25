import { Button } from '../../../components/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '../../../components/icons';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pages" className="mt-10 flex items-center justify-between gap-3">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeftIcon className="-ml-1" />
        Previous
      </Button>
      <p className="text-sm text-muted tabular-nums" aria-live="polite">
        Page {page} of {totalPages}
      </p>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
        <ChevronRightIcon className="-mr-1" />
      </Button>
    </nav>
  );
}
