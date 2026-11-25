export const MAX_MONEY = 99_999_999.99;

/** Decimal input, never cents-by-keystroke. API numbers remain locale-independent. */
export function parseDecimalInput(value: string): number | null {
  let normalized = value.trim();
  if (/^\d{1,3}(?:\.\d{3})+,\d{1,2}$/.test(normalized)) normalized = normalized.replace(/\./g, '');
  normalized = normalized.replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function decimalValue(value: string, label: string, minimum = 0, maximum = MAX_MONEY): number {
  const parsed = parseDecimalInput(value);
  if (parsed === null || parsed < minimum || parsed > maximum) {
    throw new Error(`${label}: informe um valor entre ${minimum.toLocaleString('pt-BR')} e ${maximum.toLocaleString('pt-BR')}, com até duas casas decimais.`);
  }
  return parsed;
}

export function optionalUsageLimit(value: string, label: string): number | undefined {
  if (!value.trim()) return undefined;
  if (!/^\d+$/.test(value.trim()) || Number(value) < 1 || Number(value) > 2_147_483_647) {
    throw new Error(`${label}: informe uma quantidade inteira entre 1 e 2.147.483.647.`);
  }
  return Number(value);
}
