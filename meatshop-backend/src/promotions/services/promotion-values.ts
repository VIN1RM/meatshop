import { BadRequestException } from '@nestjs/common';
import { MAX_MONEY, validDecimal } from '../../common/utils/decimal-money';
export { validDecimal } from '../../common/utils/decimal-money';

export const MAX_DISCOUNT_MONEY = MAX_MONEY;

export function assertPromotionValues(
  percentage: number | string | null | undefined,
  price: number | string | null | undefined,
  basePrice?: number,
) {
  if ((percentage != null) === (price != null)) {
    throw new BadRequestException({
      code: 'PROMOTION_INVALID_DISCOUNT',
      message: 'Informe somente o percentual ou o preço final promocional.',
    });
  }
  if (percentage != null && !validDecimal(Number(percentage), 0.01, 100)) {
    throw new BadRequestException({
      code: 'PROMOTION_INVALID_PERCENTAGE',
      message: 'O desconto deve ser de 0,01% a 100%, com até duas casas decimais.',
    });
  }
  if (price != null && !validDecimal(Number(price), 0, MAX_DISCOUNT_MONEY)) {
    throw new BadRequestException({
      code: 'PROMOTION_INVALID_PRICE',
      message: 'Informe um preço promocional válido, com até duas casas decimais.',
    });
  }
  if (price != null && Number.isFinite(basePrice) && Number(price) > basePrice!) {
    throw new BadRequestException({
      code: 'PROMOTION_PRICE_TOO_HIGH',
      message: 'O preço promocional não pode superar o preço original do produto.',
    });
  }
}
