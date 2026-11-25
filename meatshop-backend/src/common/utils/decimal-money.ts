export const MAX_MONEY = 99_999_999.99;

export function validDecimal(
  value: unknown,
  minimum: number,
  maximum = MAX_MONEY,
): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum &&
    Number(value.toFixed(2)) === value
  );
}
