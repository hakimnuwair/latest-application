import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Category } from '../../api/categories';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { FormError } from '../../components/ui/FormError';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { applyApiErrors } from '../../utils/formErrors';
import { categoryFormSchema, type CategoryForm } from './schema';
import { useSaveCategory } from './queries';

interface Props {
  open: boolean;
  /** The category being renamed, or null to add a new one. */
  category: Category | null;
  onClose: () => void;
}

export function CategoryFormModal({ open, category, onClose }: Props) {
  return (
    <Modal open={open} title={category ? 'Rename category' : 'Add category'} onClose={onClose}>
      {/* Mounted only while open, so the form always starts with the right name. */}
      <CategoryFormBody category={category} onClose={onClose} />
    </Modal>
  );
}

function CategoryFormBody({ category, onClose }: Pick<Props, 'category' | 'onClose'>) {
  const toast = useToast();
  const save = useSaveCategory();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: category?.name ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await save.mutateAsync({ id: category?.id, name: values.name });
      toast.success(category ? 'Category renamed' : 'Category added');
      onClose();
    } catch (error) {
      setServerError(applyApiErrors(error, setError, ['name']));
    }
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-4">
      <Input
        label="Name"
        autoFocus
        maxLength={60}
        error={errors.name?.message}
        {...register('name')}
      />
      <FormError message={serverError} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onClose} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={save.isPending}>
          {category ? 'Save name' : 'Add category'}
        </Button>
      </div>
    </form>
  );
}
