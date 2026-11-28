import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import type { Party } from '../../api/parties';
import { Button } from '../../components/Button';
import { DateTimeField } from '../../components/ui/DateField';
import { FormError } from '../../components/ui/FormError';
import { MoneyInput } from '../../components/ui/MoneyInput';
import { PageHeader } from '../../components/ui/PageHeader';
import { Segmented } from '../../components/ui/Segmented';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../hooks/useToast';
import { inputToIso, nowForInput } from '../../utils/dates';
import { applyApiErrors } from '../../utils/formErrors';
import { formatINR, isMoneyText, paiseToRupeesText, rupeesToPaise } from '../../utils/money';
import { suppliersConfig } from '../suppliers/config';
import { OrderLines } from '../orders/OrderLines';
import { firstLineProblem, linePaise, orderTotal, parseQty, type OrderLine } from '../orders/lines';
import { PartyPicker } from '../parties/PartyPicker';
import { MODE_OPTIONS } from '../sales/schema';
import { useCreatePurchase } from './queries';
import { purchaseFormSchema, type PurchaseForm } from './schema';

const card = 'rounded-2xl border border-line bg-white p-4 sm:p-5';

/** Stock coming in: pick products and what each cost, set how it was paid, save. The server works out the real totals and the new average cost. */
export function NewPurchasePage() {
  useDocumentTitle('New purchase');
  const navigate = useNavigate();
  const toast = useToast();
  const create = useCreatePurchase();

  const [lines, setLines] = useState<OrderLine[]>([]);
  const [supplier, setSupplier] = useState<Party | null>(null);
  const [paidTouched, setPaidTouched] = useState(false);
  const [linesError, setLinesError] = useState<string | null>(null);
  const [supplierError, setSupplierError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: { mode: 'CASH', paid: '0', purchasedAt: nowForInput() },
  });
  const mode = useWatch({ control, name: 'mode' });
  const total = orderTotal(lines);

  // Until the owner types an amount, "paid" follows the total (paid in full is the usual case).
  useEffect(() => {
    if (!paidTouched) setValue('paid', paiseToRupeesText(total));
  }, [total, paidTouched, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSupplierError(undefined);
    const problem = firstLineProblem(lines);
    setLinesError(problem);
    if (problem) return;

    let paidPaise = values.mode === 'CREDIT' ? 0 : total;
    let sendPaid: number | undefined;
    if (values.mode !== 'CREDIT' && paidTouched) {
      const parsed = isMoneyText(values.paid) ? rupeesToPaise(values.paid) : null;
      if (parsed === null) {
        setError('paid', { message: 'Enter an amount like 500 or 500.50' });
        return;
      }
      if (parsed > total) {
        setError('paid', { message: `More than the total of ${formatINR(total)}` });
        return;
      }
      paidPaise = parsed;
      sendPaid = parsed;
    }
    if (!supplier && paidPaise < total) {
      setSupplierError('Choose a supplier when the purchase is not paid in full');
      return;
    }

    try {
      const purchase = await create.mutateAsync({
        ...(supplier ? { supplierId: supplier.id } : {}),
        items: lines.map((line) => ({
          productId: line.productId,
          qty: parseQty(line.qty) ?? 1,
          unitCost: linePaise(line) ?? 0,
        })),
        mode: values.mode,
        ...(sendPaid !== undefined ? { amountPaid: sendPaid } : {}),
        purchasedAt: inputToIso(values.purchasedAt),
      });
      toast.success('Purchase saved');
      navigate(`/admin/purchases/${purchase.id}`);
    } catch (error) {
      // The form stays as it is (for example a wrong amount) so nothing has to be typed again.
      setServerError(applyApiErrors(error, setError, ['paid', 'purchasedAt']));
    }
  });

  const owedNow = mode === 'CREDIT' ? total : 0;

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      noValidate
      className="max-w-3xl"
      // Enter in a text box must never save a purchase by accident; only the Save purchase button does.
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target instanceof HTMLInputElement) e.preventDefault();
      }}
    >
      <PageHeader
        title="New purchase"
        description="Add what you bought and what each piece cost, then how you paid."
        back={
          <Link to="/admin/purchases" className="text-sm text-muted hover:text-ink">
            All purchases
          </Link>
        }
      />

      <div className="space-y-4">
        <section className={card} aria-labelledby="purchase-products">
          <h2 id="purchase-products" className="mb-3 font-display text-xl">
            Products
          </h2>
          <OrderLines
            lines={lines}
            onChange={(next) => {
              setLines(next);
              setLinesError(null);
            }}
            priceLabel="Unit cost"
            startPrice={(p) => p.avgCost}
            needsStock={false}
            disabled={create.isPending}
          />
          {linesError ? (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {linesError}
            </p>
          ) : null}
        </section>

        <section className={card} aria-labelledby="purchase-payment">
          <h2 id="purchase-payment" className="mb-3 font-display text-xl">
            Payment
          </h2>
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-sm font-medium">Paid by</p>
              <Segmented
                ariaLabel="Paid by"
                value={mode}
                options={MODE_OPTIONS}
                onChange={(value) => setValue('mode', value, { shouldDirty: true })}
              />
              {mode === 'CREDIT' ? (
                <p className="mt-2 text-sm text-muted">
                  Nothing is paid now. The full amount is added to what you owe the supplier.
                </p>
              ) : null}
            </div>

            {mode !== 'CREDIT' ? (
              <MoneyInput
                label="Paid now"
                hint="Leave as it is for paid in full. Type less if you pay part now."
                error={errors.paid?.message}
                disabled={create.isPending}
                {...register('paid', { onChange: () => setPaidTouched(true) })}
              />
            ) : null}

            <PartyPicker
              config={suppliersConfig}
              label={mode === 'CREDIT' ? 'Supplier (needed for credit)' : 'Supplier (optional)'}
              value={supplier}
              onChange={(party) => {
                setSupplier(party);
                setSupplierError(undefined);
              }}
              error={supplierError}
              disabled={create.isPending}
            />

            <DateTimeField
              label="Date and time of the purchase"
              error={errors.purchasedAt?.message}
              disabled={create.isPending}
              {...register('purchasedAt')}
            />
          </div>
        </section>

        <FormError message={serverError} />
      </div>

      <div className="sticky bottom-20 z-10 mt-6 rounded-2xl border border-line bg-white/95 p-3 shadow-lg backdrop-blur lg:bottom-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Total</p>
            <p className="text-xl font-semibold tabular-nums" data-testid="purchase-total">
              {formatINR(total)}
            </p>
            {owedNow > 0 ? (
              <p className="text-sm text-red-700">{formatINR(owedNow)} still to pay</p>
            ) : null}
          </div>
          <Button type="submit" loading={create.isPending} className="min-w-36">
            Save purchase
          </Button>
        </div>
      </div>
    </form>
  );
}
