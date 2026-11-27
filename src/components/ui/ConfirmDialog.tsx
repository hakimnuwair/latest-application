import { useState } from 'react';
import { errorMessage } from '../../api/errors';
import { Button } from '../Button';
import { FormError } from './FormError';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  /** Red button for things that delete. */
  danger?: boolean;
  /** Runs when the user confirms. If it throws, the server's message is shown here and the dialog stays open. */
  onConfirm: () => Promise<unknown>;
  onClose: () => void;
}

/** "Are you sure?" for every delete and other hard-to-undo action. The button names the action ("Delete product"). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger = false,
  onConfirm,
  onClose,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (busy) return;
    setError(null);
    onClose();
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      setBusy(false);
      onClose();
    } catch (e) {
      setBusy(false);
      setError(errorMessage(e));
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={close}
      dismissible={!busy}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            loading={busy}
            onClick={() => void confirm()}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-base">{message}</p>
        <FormError message={error} />
      </div>
    </Modal>
  );
}
