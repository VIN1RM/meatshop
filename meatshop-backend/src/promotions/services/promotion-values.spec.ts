import { validate } from 'class-validator';
import { assertPromotionValues } from './promotion-values';
import { CreatePromotionDto } from '../dtos/create-promotion.dto';
import { CouponWriteValidatorService } from './coupon-write-validator.service';
import { CouponDiscountType } from '../enums/coupon-discount-type.enum';
import { CouponType } from '../enums/coupon-type.enum';

describe('Promotion and coupon write validation', () => {
  it.each([
    [null, null],
    [10, 20],
    [101, null],
    [-1, null],
    [12.345, null],
    [NaN, null],
    [null, Infinity],
    [null, -1],
    [null, 100000000],
  ])('rejects invalid discount pair %s / %s', (percentage, price) => {
    expect(() => assertPromotionValues(percentage, price)).toThrow();
  });
  it('allows fractional and full discounts and an explicit free promotional price', () => {
    expect(() => assertPromotionValues(12.5, null)).not.toThrow();
    expect(() => assertPromotionValues(100, null)).not.toThrow();
    expect(() => assertPromotionValues(null, 0)).not.toThrow();
    expect(() => assertPromotionValues(null, 51, 50)).toThrow();
  });
  it('validates supplied promotion fields even when both are present', async () => {
    const dto = Object.assign(new CreatePromotionDto(), {
      unit_id: 1,
      product_id: 1,
      title: 'Oferta',
      starts_at: '2099-01-01T00:00:00Z',
      ends_at: '2099-01-02T00:00:00Z',
      discount_percentage: 120,
      promotional_price: -1,
    });
    const fields = (await validate(dto)).map((error) => error.property);
    expect(fields).toContain('discount_percentage');
    expect(fields).toContain('promotional_price');
  });
  it('validates coupon precision, percentage limits, fixed money and counters', async () => {
    const service = new CouponWriteValidatorService({} as never);
    const dto = {
      code: 'MEAT10',
      name: 'Cupom',
      type: CouponType.PLATFORM,
      discount_type: CouponDiscountType.PERCENTAGE,
      discount_amount: 12.5,
      starts_at: '2099-01-01T00:00:00Z',
      expires_at: '2099-02-01T00:00:00Z',
    };
    await expect(service.validate(dto)).resolves.toBeUndefined();
    for (const discountAmount of [0, -1, 100.01, 1.234, Infinity])
      await expect(service.validate({ ...dto, discount_amount: discountAmount })).rejects.toThrow();
    await expect(
      service.validate({
        ...dto,
        discount_type: CouponDiscountType.FIXED,
        discount_amount: 150.75,
      }),
    ).resolves.toBeUndefined();
    await expect(service.validate({ ...dto, total_usage_limit: 1.5 })).rejects.toThrow();
    await expect(service.validate({ ...dto, minimum_order_value: -1 })).rejects.toThrow();
  });
});
