import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min, Max } from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) unit_id: number;
  @ApiProperty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(99999999.99)
  subtotal: number;
}
