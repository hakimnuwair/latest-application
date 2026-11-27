import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import type { InventoryItem } from '../../api/inventory';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { FormError } from '../../components/ui/FormError';
import { Modal } from '../../components/ui/Modal';
import { Segmented } from '../../components/ui/Segmented';
import { Textarea } from '../../components/ui/Textarea';
import { useToast } from '../../hooks/useToast';
import { applyApiErrors } from '../../utils/formErrors';
import { useAdjustStock } from './queries';

const schema = z.object({
  qty: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, 'Enter a whole number, 1 or more')
    .refine((v) => Number(v) <= 1_000_000, 'At most 1,000,000'),
  reason: z
    .string()
    .trim()
    .min(3, 'Write a short reason (at least 3 characters)')
    .max(200, 'At most 200 characters'),
});
type Form = z.infer<typeof schema>;

type Direction = 'add' | 'remove';
const DIRECTIONS = [
  { value: 'add', label: 'Add stock' },
  { value: 'remove', label: 'Remove stock' },
] as const;
const QUICK_REASONS = ['Stock count correction', 'Damaged', 'Lost', 'Found extra'];

interface Props {
  item: InventoryItem | null;
  onClose: () => void;
}

export function AdjustStockModal({ item, onClose }: Props) {
  return (
    <Modal open={item !== null} title="Adjust stock" onClose={onClose}>
      {item ? <AdjustBody item={item} onClose={onClose} /> : null}
    </Modal>
  );
}

function AdjustBody({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const toast = useToast();
  const adjust = useAdjustStock();
  const [direction, setDirection] = useState<Direction>('add');
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { qty: '', reason: '' } });

  const qtyText = useWatch({ control, name: 'qty' });
  const qty = /^[1-9]\d*$/.test(qtyText.trim()) ? Number(qtyText.trim()) : null;
  // A preview only. The server decides (it refuses to go below 0).
  const after = qty === null ? null : item.stockQty + (direction === 'add' ? qty : -qty);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const change = Number(values.qty) * (direction === 'add' ? 1 : -1);
    try {
      await adjust.mutateAsync({ productId: item.id, qtyChange: change, reason: values.reason });
      toast.success(`Stock of "${item.name}" updated`);
      onClose();
    } catch (error) {
      setServerError(applyApiErrors(error, setError, ['reason']));
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-4">
      <div>
        <p className="font-semibold">{item.name}</p>
        <p className="text-sm text-muted">In stock now: {item.stockQty}</p>
      </div>

      <Segmented
        ariaLabel="Add or remove stock"
        value={direction}
        options={DIRECTIONS}
        onChange={setDirection}
      />

      <Input
        label="How many pieces"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        error={errors.qty?.message}
        {...register('qty')}
      />

      <div className="space-y-2">
        <Textarea
          label="Reason"
          rows={2}
          maxLength={200}
          error={errors.reason?.message}
          {...register('reason')}
        />
        <div className="flex flex-wrap gap-2">
          {QUICK_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => setValue('reason', reason, { shouldValidate: true })}
              className="min-h-9 rounded-full border border-line bg-white px-3 text-sm font-medium transition hover:bg-oud-soft"
            >
              {reason}
            </button>
          ))}
        </div>
      </div>

      <p className="rounded-lg bg-mist px-3 py-2 text-sm" aria-live="polite">
        {after === null ? (
          'Enter how many pieces to see the new stock.'
        ) : after < 0 ? (
          <span className="text-red-700">
            That is more than the {item.stockQty} in stock. The shop will refuse it.
          </span>
        ) : (
          <>
            Stock after this: <strong className="tabular-nums">{after}</strong>
          </>
        )}
      </p>

      <FormError message={serverError} />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onClose} disabled={adjust.isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={adjust.isPending}>
          Save adjustment
        </Button>
      </div>
    </form>
  );
}
