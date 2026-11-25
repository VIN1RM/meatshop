export const CATEGORY_GROUPS = {
  BEEF: 'Bovinos',
  PORK: 'Suínos',
  POULTRY: 'Aves',
  FISH: 'Peixes',
  OTHER: 'Outros',
} as const;

export type CategoryGroup = keyof typeof CATEGORY_GROUPS;
