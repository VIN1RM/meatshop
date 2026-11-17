import { formatQuantity } from './formatters';

describe('Product quantities in Brazilian Portuguese', () => {
  it.each([
    ['32.000', 'KG', '32 kg'],
    ['2.450', 'kg', '2,45 kg'],
    ['68.500', 'KG', '68,5 kg'],
    ['0.001', 'kg', '0,001 kg'],
    ['2450.000', 'kg', '2.450 kg'],
    [0, 'UN', '0 un'],
    [4, 'PCT', '4 pct'],
  ])('formats %s %s without interpreting API decimals as thousands', (value, unit, expected) => {
    expect(formatQuantity(value, String(unit))).toBe(expected);
  });
});
