import { BadRequestException } from '@nestjs/common';
import { validDecimal } from '../../common/utils/decimal-money';

export function expenseValues(data: {
  amount: number | string;
  discount?: number | string | null;
  paidAmount: number | string;
}) {
  const amount = Number(data.amount);
  const discount = Number(data.discount ?? 0);
  const paidAmount = Number(data.paidAmount);
  if (
    !validDecimal(amount, 0.01) ||
    !validDecimal(discount, 0) ||
    !validDecimal(paidAmount, 0) ||
    discount > amount ||
    Math.round(paidAmount * 100) > Math.round(amount * 100) - Math.round(discount * 100)
  ) {
    throw new BadRequestException({
      code: 'EXPENSE_INVALID_VALUES',
      message:
        'Informe uma despesa positiva. Desconto e pagamento não podem superar o valor devido.',
    });
  }
  return { amount, discount, paidAmount };
}
