import { expenseValues } from './expense-values';

describe('Expense monetary validation', () => {
  it('accepts decimal database values and partial or full payments', () => {
    expect(expenseValues({ amount: '100.50', discount: '10.25', paidAmount: '90.25' })).toEqual({
      amount: 100.5,
      discount: 10.25,
      paidAmount: 90.25,
    });
    expect(expenseValues({ amount: 100, paidAmount: 0 }).paidAmount).toBe(0);
    expect(expenseValues({ amount: 100, discount: 10, paidAmount: 50 }).paidAmount).toBe(50);
  });
  it.each([
    { amount: -1, paidAmount: 0 },
    { amount: 0, paidAmount: 0 },
    { amount: 100, discount: -1, paidAmount: 0 },
    { amount: 100, discount: 101, paidAmount: 0 },
    { amount: 100, discount: 10, paidAmount: 90.01 },
    { amount: 1.234, paidAmount: 0 },
    { amount: Infinity, paidAmount: 0 },
    { amount: 100000000, paidAmount: 0 },
  ])('rejects invalid amounts or inconsistent discounts/payment: %j', (value) => {
    expect(() => expenseValues(value)).toThrow();
  });
});
