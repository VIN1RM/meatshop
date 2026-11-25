export enum CategoryGroup {
  BEEF = 'BEEF',
  PORK = 'PORK',
  POULTRY = 'POULTRY',
  FISH = 'FISH',
  OTHER = 'OTHER',
}

/** Compatibility for existing categories and older clients without a group. */
export function inferCategoryGroup(name: string): CategoryGroup {
  const words = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const matches = [
    [CategoryGroup.BEEF, /\b(bovinos?|bovinas?|beef)\b/],
    [CategoryGroup.PORK, /\b(suinos?|suinas?|porcos?|porco|pork)\b/],
    [CategoryGroup.POULTRY, /\b(aves?|frangos?|galinhas?|poultry)\b/],
    [CategoryGroup.FISH, /\b(peixes?|pescados?|fish)\b/],
  ] as const;
  const groups = matches.filter(([, pattern]) => pattern.test(words));
  return groups.length === 1 ? groups[0][0] : CategoryGroup.OTHER;
}
