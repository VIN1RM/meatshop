import { BUSINESS_TIME_ZONE, formatDateValue } from './date-time';

export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: BUSINESS_TIME_ZONE,
  dateStyle: "short",
});

export const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: BUSINESS_TIME_ZONE,
  dateStyle: "short",
  timeStyle: "short",
});

export function formatCurrency(value: number | string | null | undefined) {
  return currencyFormatter.format(Number(value ?? 0));
}

export function formatDate(value: string | null | undefined) {
  return formatDateValue(value);
}

const quantityFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

export function formatUnit(unit: string | null | undefined): string {
  return unit?.trim().toLowerCase() ?? '';
}

export function formatQuantity(value: number | string | null | undefined, unit?: string | null): string {
  const quantity = Number(value ?? 0);
  const formatted = Number.isFinite(quantity) ? quantityFormatter.format(quantity) : 'Não informado';
  const symbol = formatUnit(unit);
  return symbol ? `${formatted} ${symbol}` : formatted;
}

export function formatTime(value: string | null | undefined) {
  return formatDateValue(value, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}

export function formatDateTime(value: string | null | undefined) {
  return formatDateValue(value, { dateStyle: 'short', timeStyle: 'short' });
}
