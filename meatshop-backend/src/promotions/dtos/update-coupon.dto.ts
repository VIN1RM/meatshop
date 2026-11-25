import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCouponDto } from './create-coupon.dto';
import { IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateCouponDto extends PartialType(
  OmitType(CreateCouponDto, [
    'code',
    'maximum_discount',
    'total_usage_limit',
    'usage_limit_per_user',
  ] as const),
  { skipNullProperties: false },
) {
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(99999999.99) maximum_discount?:
    number | null;

  @IsOptional() @IsInt() @Min(1) @Max(2147483647) total_usage_limit?: number | null;
  @IsOptional() @IsInt() @Min(1) @Max(2147483647) usage_limit_per_user?: number | null;
}
