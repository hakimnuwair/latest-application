import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { errorMessage, isNotFound } from '../../api/errors';
import type { AdminProduct } from '../../api/products';
import type { Category } from '../../api/categories';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ArrowLeftIcon, ExternalIcon, TrashIcon } from '../../components/icons';
import { RetryButton, StateMessage } from '../../components/StateMessage';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FormError } from '../../components/ui/FormError';
import { MoneyInput } from '../../components/ui/MoneyInput';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { Textarea } from '../../components/ui/Textarea';
import { Toggle } from '../../components/ui/Toggle';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks/useToast';
import { applyApiErrors } from '../../utils/formErrors';
import { formatINR } from '../../utils/money';
import { useCategories } from '../categories/queries';
import { MediaManager } from './components/MediaManager';
import { useCreateProduct, useDeleteProduct, useProduct, useUpdateProduct } from './queries';
import {
  changedFields,
  emptyProductForm,
  FORM_FIELDS,
  formFromProduct,
  productFormSchema,
  toProductInput,
  type ProductForm,
} from './schema';

const card = 'space-y-4 rounded-2xl border border-line bg-white p-4 sm:p-5';

const back = (
  <Link
    to="/admin/products"
    className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-muted hover:text-ink"
  >
    <ArrowLeftIcon width={18} height={18} />
    All products
  </Link>
);

/** /admin/products/new (empty form) and /admin/products/:id (edit, photos, stock facts). */
export function ProductFormPage() {
  const { id } = useParams();
  const product = useProduct(id);
  const categories = useCategories();
  useDocumentTitle(id ? (product.data?.name ?? 'Edit product') : 'Add product');

  if (id && product.isPending) {
    return (
      <section>
        <PageHeader title="Edit product" back={back} />
        <div className="space-y-4" role="status" aria-label="Loading">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </section>
    );
  }
  if (id && product.isError) {
    return (
      <section>
        <PageHeader title="Edit product" back={back} />
        {isNotFound(product.error) ? (
          <StateMessage
            title="Product not found"
            message="It may have been deleted."
            action={
              <Link
                to="/admin/products"
                className="inline-flex min-h-11 items-center rounded-lg bg-oud px-4 font-medium text-white"
              >
                See all products
              </Link>
            }
          />
        ) : (
          <StateMessage
            title="Couldn't load this product"
            message={errorMessage(product.error)}
            action={<RetryButton onClick={() => void product.refetch()} />}
          />
        )}
      </section>
    );
  }
  if (categories.isPending) {
    return (
      <section>
        <PageHeader title={id ? 'Edit product' : 'Add product'} back={back} />
        <Skeleton className="h-64 rounded-2xl" />
      </section>
    );
  }
  if (categories.isError) {
    return (
      <section>
        <PageHeader title={id ? 'Edit product' : 'Add product'} back={back} />
        <StateMessage
          title="Couldn't load the categories"
          message={errorMessage(categories.error)}
          action={<RetryButton onClick={() => void categories.refetch()} />}
        />
      </section>
    );
  }
  if (!id && categories.data.length === 0) {
    return (
      <section>
        <PageHeader title="Add product" back={back} />
        <StateMessage
          title="Add a category first"
          message="Every product belongs to a category."
          action={
            <Link
              to="/admin/categories"
              className="inline-flex min-h-11 items-center rounded-lg bg-oud px-4 font-medium text-white"
            >
              Go to categories
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <ProductEditor
      key={product.data?.id ?? 'new'}
      product={product.data ?? null}
      categories={categories.data}
    />
  );
}

function ProductEditor({
  product,
  categories,
}: {
  product: AdminProduct | null;
  categories: Category[];
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const create = useCreateProduct();
  const update = useUpdateProduct(product?.id ?? '');
  const remove = useDeleteProduct();
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductForm>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? formFromProduct(product) : emptyProductForm(),
  });

  // The product's own category may have been deleted since: keep it in the list so the form still shows it.
  const options =
    product && !categories.some((c) => c.id === product.categoryId)
      ? [product.category, ...categories]
      : categories;
  const saving = create.isPending || update.isPending;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const input = toProductInput(values);
    try {
      if (!product) {
        const created = await create.mutateAsync(input);
        toast.success('Product added. You can add photos now.');
        navigate(`/admin/products/${created.id}`, { replace: true });
        return;
      }
      const changes = changedFields(input, product);
      if (Object.keys(changes).length === 0) {
        toast.success('Nothing to save');
        return;
      }
      const updated = await update.mutateAsync(changes);
      reset(formFromProduct(updated));
      toast.success('Changes saved');
    } catch (error) {
      setServerError(applyApiErrors(error, setError, FORM_FIELDS));
    }
  });

  return (
    <section>
      <PageHeader
        title={product ? 'Edit product' : 'Add product'}
        description={
          product ? product.name : 'Fill in the details. You can add photos after saving.'
        }
        back={back}
        action={
          product?.isActive ? (
            <a
              href={`/products/${encodeURIComponent(product.slug)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line bg-white px-4 text-sm font-medium transition hover:bg-oud-soft"
            >
              <ExternalIcon width={18} height={18} />
              View in shop
            </a>
          ) : undefined
        }
      />

      <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-4">
        <div className={card}>
          <h2 className="font-display text-2xl">Details</h2>
          <Input
            label="Product name"
            maxLength={120}
            error={errors.name?.message}
            {...register('name')}
          />
          <Select label="Category" error={errors.categoryId?.message} {...register('categoryId')}>
            <option value="">Choose a category</option>
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Textarea
            label="Description"
            hint="Shown on the product page in the shop. Optional."
            maxLength={2000}
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className={card}>
          <h2 className="font-display text-2xl">Price and stock</h2>
          <MoneyInput
            label="Selling price"
            error={errors.sellingPrice?.message}
            {...register('sellingPrice')}
          />
          <Input
            label="SKU (optional)"
            hint="Your own code for this product. Must be unique."
            maxLength={60}
            error={errors.sku?.message}
            {...register('sku')}
          />
          <Input
            label="Low stock level"
            inputMode="numeric"
            hint="You are warned when stock falls to this number or below."
            error={errors.lowStockAt?.message}
            {...register('lowStockAt')}
          />
        </div>

        <div className={card}>
          <h2 className="font-display text-2xl">In the shop</h2>
          <Toggle
            label="Visible in the shop"
            hint="Turn off to hide it from shoppers without deleting it."
            {...register('isActive')}
          />
          <Toggle
            label="Show the price"
            hint="When off, shoppers are told to ask in the shop."
            {...register('showPrice')}
          />
          <Toggle
            label="Show how many are in stock"
            hint="When off, shoppers only see In stock or Out of stock."
            {...register('showQuantity')}
          />
        </div>

        <FormError message={serverError} />

        <div className="sticky bottom-20 z-10 flex flex-col-reverse gap-2 rounded-2xl border border-line bg-white/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end lg:bottom-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/products')}
            disabled={saving}
          >
            {product ? 'Close' : 'Cancel'}
          </Button>
          <Button type="submit" loading={saving} disabled={Boolean(product) && !isDirty}>
            {product ? 'Save changes' : 'Add product'}
          </Button>
        </div>
      </form>

      {product ? (
        <div className="mt-6 space-y-4">
          <div className={card}>
            <MediaManager productId={product.id} />
          </div>

          <div className={card}>
            <h2 className="font-display text-2xl">Stock facts</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted">In stock now</dt>
                <dd className="text-2xl font-semibold tabular-nums">{product.stockQty}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Average cost per piece</dt>
                <dd className="text-2xl font-semibold tabular-nums">
                  {formatINR(product.avgCost)}
                </dd>
              </div>
            </dl>
            <p className="text-sm text-muted">
              These change only through purchases, sales and stock adjustments, never by editing the
              product.
            </p>
            <Link
              to={`/admin/inventory?search=${encodeURIComponent(product.name)}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-line bg-white px-4 text-sm font-medium transition hover:bg-oud-soft"
            >
              Adjust stock in Inventory
            </Link>
          </div>

          <div className={card}>
            <h2 className="font-display text-2xl">Delete product</h2>
            <p className="text-sm text-muted">
              Removes it from the shop and your lists. Past sales and purchases keep their records.
              A product with stock left cannot be deleted: bring its stock to 0 first.
            </p>
            <Button variant="danger" onClick={() => setDeleting(true)}>
              <TrashIcon className="mr-1.5" />
              Delete product
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={deleting}
        title="Delete product"
        message={`Delete "${product?.name ?? ''}"? It disappears from the shop.`}
        confirmLabel="Delete product"
        danger
        onConfirm={async () => {
          if (!product) return;
          await remove.mutateAsync(product.id);
          toast.success('Product deleted');
          navigate('/admin/products', { replace: true });
        }}
        onClose={() => setDeleting(false)}
      />
    </section>
  );
}
