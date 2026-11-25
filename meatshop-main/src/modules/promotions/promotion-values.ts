import { decimalValue } from '@/shared/lib/decimal-input';

export function promotionValues(form: { discountMode: 'percentage' | 'price'; discount_percentage: string; promotional_price: string }) {
  return form.discountMode === 'percentage'
    ? { discount_percentage: decimalValue(form.discount_percentage, 'Desconto (%)', 0.01, 100), promotional_price: null }
    : { promotional_price: decimalValue(form.promotional_price, 'Preço promocional'), discount_percentage: null };
}
