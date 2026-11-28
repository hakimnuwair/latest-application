import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { LedgerEntry } from '../../api/parties';
import type { PaymentChanges, PaymentMode } from '../../api/payments';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { DateTimeField } from '../../components/ui/DateField';
import { labelClass } from '../../components/ui/fieldStyles';
import { FormError } from '../../components/ui/FormError';
import { MoneyInput } from '../../components/ui/MoneyInput';
import { Modal } from '../../components/ui/Modal';
import { Segmented } from '../../components/ui/Segmented';
import { useToast } from '../../hooks/useToast';
import { inputToIso, isoToInput, nowForInput } from '../../utils/dates';
import { applyApiErrors } from '../../utils/formErrors';
import { formatINR, paiseToRupeesText, rupeesToPaise } from '../../utils/money';
import { useCreatePayment, useUpdatePayment } from './queries';
import { paymentFormSchema, type PaymentForm } from './schema';
import type { PartyConfig } from './types';

const MODES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'ONLINE', label: 'Online' },
] as const;

interface Props {
  open: boolean;
  config: PartyConfig;
  partyId: string;
  /** What is outstanding now (from the ledger). Shown as a hint; the server checks the real limit. */
  outstanding: number;
  /** The payment line being edited, or null to record a new payment. */
  entry: LedgerEntry | null;
  onClose: () => void;
}

/** Record, or edit, a payment for a customer or a supplier. */
export function PaymentModal({ open, config, partyId, outstanding, entry, onClose }: Props) {
  return (
    <Modal open={open} title={entry ? 'Edit payment' : config.payLabel} onClose={onClose}>
      <PaymentBody
        config={config}
        partyId={partyId}
        outstanding={outstanding}
        entry={entry}
        onClose={onClose}
      />
    </Modal>
  );
}

function PaymentBody({ config, partyId, outstanding, entry, onClose }: Omit<Props, 'open'>) {
  const toast = useToast();
  const create = useCreatePayment(config, partyId);
  const update = useUpdatePayment(config, partyId);
  const saving = create.isPending || update.isPending;
  const [serverError, setServerError] = useState<string | null>(null);

  const initialMode: PaymentMode = entry?.mode === 'ONLINE' ? 'ONLINE' : 'CASH';
  const initialAt = entry ? isoToInput(entry.date) : nowForInput();
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: entry ? paiseToRupeesText(entry.decrease) : '',
      mode: initialMode,
      note: entry?.note ?? '',
      paidAt: initialAt,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const paise = rupeesToPaise(values.amount);
    if (paise === null) return;
    try {
      let after: number;
      if (entry) {
        // Send only what changed, so an untouched date keeps its exact seconds.
        const changes: PaymentChanges = {};
        if (paise !== entry.decrease) changes.amount = paise;
        if (values.mode !== initialMode) changes.mode = values.mode;
        if (values.note !== (entry.note ?? '')) changes.note = values.note;
        if (values.paidAt !== initialAt) changes.paidAt = inputToIso(values.paidAt);
        after = (await update.mutateAsync({ id: entry.refId, changes })).outstandingAfter;
      } else {
        after = (
          await create.mutateAsync({
            amount: paise,
            mode: values.mode,
            ...(values.note ? { note: values.note } : {}),
            paidAt: inputToIso(values.paidAt),
          })
        ).outstandingAfter;
      }
      toast.success(
        `${entry ? 'Payment updated' : 'Payment recorded'}. ${config.afterText(after)}`,
      );
      onClose();
    } catch (error) {
      setServerError(applyApiErrors(error, setError, ['amount', 'mode', 'note', 'paidAt']));
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-4">
      <div>
        <MoneyInput
          label="Amount"
          autoFocus
          error={errors.amount?.message}
          hint={entry ? undefined : `Outstanding now: ${formatINR(outstanding)}`}
          {...register('amount')}
        />
        {!entry && outstanding > 0 ? (
          <button
            type="button"
            onClick={() =>
              setValue('amount', paiseToRupeesText(outstanding), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className="mt-1 inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-oud hover:bg-oud-soft"
          >
            Use the full amount
          </button>
        ) : null}
      </div>

      <div className="space-y-1">
        <p className={labelClass}>Paid by</p>
        <Controller
          control={control}
          name="mode"
          render={({ field }) => (
            <Segmented
              ariaLabel="Paid by"
              value={field.value}
              options={MODES}
              onChange={(value) => field.onChange(value)}
            />
          )}
        />
      </div>

      <DateTimeField label="Date and time" error={errors.paidAt?.message} {...register('paidAt')} />
      <Input
        label="Note (optional)"
        maxLength={200}
        autoComplete="off"
        error={errors.note?.message}
        {...register('note')}
      />

      <FormError message={serverError} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving} disabled={entry !== null && !isDirty}>
          {entry ? 'Save changes' : config.payLabel}
        </Button>
      </div>
    </form>
  );
}
