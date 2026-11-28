import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Party } from '../../api/parties';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { FormError } from '../../components/ui/FormError';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { applyApiErrors } from '../../utils/formErrors';
import { useSaveParty } from './queries';
import { partyFormSchema, type PartyForm } from './schema';
import type { PartyConfig } from './types';

interface Props {
  open: boolean;
  config: PartyConfig;
  /** The one being edited, or null to add a new one. */
  party: Party | null;
  onClose: () => void;
  /** Called with the saved party (the sale and purchase screens use it to pick the new one). */
  onSaved?: (party: Party) => void;
}

/** Add or edit a customer or supplier. Same form for both; the config supplies the words. */
export function PartyFormModal({ open, config, party, onClose, onSaved }: Props) {
  const title = party ? `Edit ${config.singular}` : config.addLabel;
  return (
    <Modal open={open} title={title} onClose={onClose}>
      {/* Mounted only while open, so the form always starts with the right values. */}
      <PartyFormBody config={config} party={party} onClose={onClose} onSaved={onSaved} />
    </Modal>
  );
}

function PartyFormBody({ config, party, onClose, onSaved }: Omit<Props, 'open'>) {
  const toast = useToast();
  const save = useSaveParty(config);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<PartyForm>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: { name: party?.name ?? '', phone: party?.phone ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const saved = await save.mutateAsync({
        id: party?.id,
        // On add an empty phone is simply left out; on edit "" clears it.
        values: party
          ? { name: values.name, phone: values.phone }
          : { name: values.name, ...(values.phone ? { phone: values.phone } : {}) },
      });
      toast.success(party ? 'Changes saved' : `"${saved.name}" added`);
      onSaved?.(saved);
      onClose();
    } catch (error) {
      setServerError(applyApiErrors(error, setError, ['name', 'phone']));
    }
  });

  return (
    <form
      onSubmit={(e) => {
        // Never let this submit reach a form that this dialog was opened from (the sale screen).
        e.stopPropagation();
        void onSubmit(e);
      }}
      noValidate
      className="space-y-4"
    >
      <Input
        label="Name"
        autoFocus
        maxLength={120}
        autoComplete="off"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Phone (optional)"
        type="tel"
        inputMode="tel"
        maxLength={30}
        autoComplete="off"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <FormError message={serverError} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onClose} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={save.isPending} disabled={party !== null && !isDirty}>
          {party ? 'Save changes' : config.addLabel}
        </Button>
      </div>
    </form>
  );
}
