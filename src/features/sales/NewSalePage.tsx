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
import { customersConfig } from '../customers/config';
import { OrderLines } from '../orders/OrderLines';
import { firstLineProblem, linePaise, orderTotal, parseQty, type OrderLine } from '../orders/lines';
import { PartyPicker } from '../parties/PartyPicker';
import { useCreateSale } from './queries';
import { MODE_OPTIONS, saleFormSchema, type SaleForm } from './schema';

const card = 'rounded-2xl border border-line bg-white p-4 sm:p-5';

/** The screen used all day: pick products, set how it was paid, save. The server works out the real totals. */
export function NewSalePage() {
  useDocumentTitle('New sale');
  const navigate = useNavigate();
  const toast = useToast();
  const create = useCreateSale();

  const [lines, setLines] = useState<OrderLine[]>([]);
  const [customer, setCustomer] = useState<Party | null>(null);
  const [paidTouched, setPaidTouched] = useState(false);
  const [linesError, setLinesError] = useState<string | null>(null);
  const [customerError, setCustomerError] = useState<string | undefined>();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<SaleForm>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: { mode: 'CASH', paid: '0', soldAt: nowForInput() },
  });
  const mode = useWatch({ control, name: 'mode' });
  const total = orderTotal(lines);

  // Until the owner types an amount, "paid" follows the total (paid in full is the usual case).
  useEffect(() => {
    if (!paidTouched) setValue('paid', paiseToRupeesText(total));
  }, [total, paidTouched, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setCustomerError(undefined);
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
    if (!customer && paidPaise < total) {
      setCustomerError('Choose a customer when the sale is not paid in full');
      return;
    }

    try {
      const sale = await create.mutateAsync({
        ...(customer ? { customerId: customer.id } : {}),
        items: lines.map((line) => ({
          productId: line.productId,
          qty: parseQty(line.qty) ?? 1,
          unitPrice: linePaise(line) ?? 0,
        })),
        mode: values.mode,
        ...(sendPaid !== undefined ? { amountPaid: sendPaid } : {}),
        soldAt: inputToIso(values.soldAt),
      });
      toast.success('Sale saved');
      navigate(`/admin/sales/${sale.id}`);
    } catch (error) {
      // The form stays as it is (for example "not enough stock") so nothing has to be typed again.
      setServerError(applyApiErrors(error, setError, ['paid', 'soldAt']));
    }
  });

  const owedNow = mode === 'CREDIT' ? total : 0;

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      noValidate
      className="max-w-3xl"
      // Enter in a text box must never save a sale by accident; only the Save sale button does.
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target instanceof HTMLInputElement) e.preventDefault();
      }}
    >
      <PageHeader
        title="New sale"
        description="Add what was sold, then how it was paid."
        back={
          <Link to="/admin/sales" className="text-sm text-muted hover:text-ink">
            All sales
          </Link>
        }
      />

      <div className="space-y-4">
        <section className={card} aria-labelledby="sale-products">
          <h2 id="sale-products" className="mb-3 font-display text-xl">
            Products
          </h2>
          <OrderLines
            lines={lines}
            onChange={(next) => {
              setLines(next);
              setLinesError(null);
            }}
            priceLabel="Price per piece"
            startPrice={(p) => p.sellingPrice}
            needsStock
            disabled={create.isPending}
          />
          {linesError ? (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {linesError}
            </p>
          ) : null}
        </section>

        <section className={card} aria-labelledby="sale-payment">
          <h2 id="sale-payment" className="mb-3 font-display text-xl">
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
                  Nothing is paid now. The full amount goes on the customer's account.
                </p>
              ) : null}
            </div>

            {mode !== 'CREDIT' ? (
              <MoneyInput
                label="Paid now"
                hint="Leave as it is for paid in full. Type less if the customer pays part."
                error={errors.paid?.message}
                disabled={create.isPending}
                {...register('paid', { onChange: () => setPaidTouched(true) })}
              />
            ) : null}

            <PartyPicker
              config={customersConfig}
              label={mode === 'CREDIT' ? 'Customer (needed for credit)' : 'Customer (optional)'}
              value={customer}
              onChange={(party) => {
                setCustomer(party);
                setCustomerError(undefined);
              }}
              error={customerError}
              disabled={create.isPending}
            />

            <DateTimeField
              label="Date and time of the sale"
              error={errors.soldAt?.message}
              disabled={create.isPending}
              {...register('soldAt')}
            />
          </div>
        </section>

        <FormError message={serverError} />
      </div>

      <div className="sticky bottom-20 z-10 mt-6 rounded-2xl border border-line bg-white/95 p-3 shadow-lg backdrop-blur lg:bottom-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Total</p>
            <p className="text-xl font-semibold tabular-nums" data-testid="sale-total">
              {formatINR(total)}
            </p>
            {owedNow > 0 ? (
              <p className="text-sm text-red-700">{formatINR(owedNow)} on account</p>
            ) : null}
          </div>
          <Button type="submit" loading={create.isPending} className="min-w-36">
            Save sale
          </Button>
        </div>
      </div>
    </form>
  );
}
