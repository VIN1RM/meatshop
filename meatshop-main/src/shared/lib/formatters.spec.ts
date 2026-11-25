import { formatDate, formatDateTime, formatTime, formatQuantity } from './formatters';
import { dateBoundaryToISO, datetimeLocalToISO } from './date-time';

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

describe('Brasilia timestamps', () => {
  it('shows the same instant consistently for messages, orders and deadlines', () => {
    expect(formatTime('2026-11-25T00:22:00Z')).toBe('21:22');
    expect(formatTime('2026-11-24T21:22:00-03:00')).toBe('21:22');
    expect(formatDateTime('2026-11-25T00:22:00Z')).toBe('24/11/2026, 21:22');
  });

  it('uses the Brasilia date across midnight and year boundaries', () => {
    expect(formatDate('2027-01-01T02:59:59Z')).toBe('31/12/2026');
    expect(formatTime('2027-01-01T03:00:00Z')).toBe('00:00');
    expect(formatDate('2027-01-01')).toBe('01/01/2027');
  });

  it('sends schedule inputs and entire-day filters as unambiguous instants', () => {
    expect(datetimeLocalToISO('2026-11-24T21:22')).toBe('2026-11-25T00:22:00.000Z');
    expect(dateBoundaryToISO('2026-11-24')).toBe('2026-11-24T03:00:00.000Z');
    expect(dateBoundaryToISO('2026-11-24', true)).toBe('2026-11-25T02:59:59.999Z');
  });
});
