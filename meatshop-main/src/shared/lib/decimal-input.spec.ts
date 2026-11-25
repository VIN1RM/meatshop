import { parseDecimalInput, decimalValue, optionalUsageLimit } from './decimal-input';
import { promotionValues } from '@/modules/promotions/promotion-values';
import { couponValues } from '@/modules/coupons/coupon-values';
import type { CouponFormState } from '@/modules/coupons/coupon-form-dialog';

describe('Decimal money and percentages', () => {
  it.each(['1234,56', '1234.56', '1.234,56'])('parses %s without changing its magnitude', value => {
    expect(parseDecimalInput(value)).toBe(1234.56);
  });
  it.each(['', ' ', '-1', 'NaN', 'Infinity', '1e3', '1.234', '1,234', '1.234.56', '12abc', '1,234.56'])('rejects malformed or overly precise %s', value => {
    expect(parseDecimalInput(value)).toBeNull();
    expect(() => decimalValue(value, 'Valor')).toThrow();
  });
  it('enforces percentage limits, preserves fractions and clears the other promotion mode', () => {
    expect(promotionValues({ discountMode: 'percentage', discount_percentage: '12,50', promotional_price: '99' })).toEqual({ discount_percentage: 12.5, promotional_price: null });
    expect(promotionValues({ discountMode: 'price', discount_percentage: '12', promotional_price: '0' })).toEqual({ discount_percentage: null, promotional_price: 0 });
    for (const value of ['0', '100,01', '12,555']) expect(() => promotionValues({ discountMode: 'percentage', discount_percentage: value, promotional_price: '' })).toThrow();
  });
  it('limits counters to positive database integers and treats blank as unlimited', () => {
    expect(optionalUsageLimit('', 'Limite')).toBeUndefined();
    expect(optionalUsageLimit('15', 'Limite')).toBe(15);
    for (const value of ['0', '-1', '1.5', '1e3', '2147483648']) expect(() => optionalUsageLimit(value, 'Limite')).toThrow();
  });
  it('keeps fixed coupon amounts distinct from percentages and ignores a previous percentage cap', () => {
    const form = { code: 'CARNE10', name: 'Cupom de carnes', discount_type: 'FIXED', discount_amount: '150,75', maximum_discount: '20', minimum_order_value: '', total_usage_limit: '', usage_limit_per_user: '' } as CouponFormState;
    expect(couponValues(form)).toMatchObject({ discount_amount: 150.75, maximum_discount: undefined, minimum_order_value: 0 });
    expect(() => couponValues({ ...form, discount_type: 'PERCENTAGE' })).toThrow();
  });
});
