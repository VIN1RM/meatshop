import { decimalValue, optionalUsageLimit } from '@/shared/lib/decimal-input';
import type { CouponFormState } from './coupon-form-dialog';

export function couponValues(form: CouponFormState) {
  if (!/^[A-Za-z0-9_-]{1,50}$/.test(form.code.trim())) throw new Error('Código do cupom: use até 50 letras, números, hífen ou sublinhado.');
  if (form.name.trim().length < 3 || form.name.trim().length > 120) throw new Error('Informe um nome para o cupom com 3 a 120 caracteres.');
  const percentage = form.discount_type === 'PERCENTAGE';
  return {
    discount_amount: decimalValue(form.discount_amount, percentage ? 'Desconto (%)' : 'Desconto (R$)', 0.01, percentage ? 100 : undefined),
    maximum_discount: percentage && form.maximum_discount.trim() ? decimalValue(form.maximum_discount, 'Teto do desconto', 0.01) : undefined,
    minimum_order_value: form.minimum_order_value.trim() ? decimalValue(form.minimum_order_value, 'Pedido mínimo') : 0,
    total_usage_limit: optionalUsageLimit(form.total_usage_limit, 'Limite total'),
    usage_limit_per_user: optionalUsageLimit(form.usage_limit_per_user, 'Limite por cliente'),
  };
}
