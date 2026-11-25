import { validate } from 'class-validator';
import { CategoryGroup, inferCategoryGroup } from './category-group';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

describe('Category groups', () => {
  it.each([
    ['Bovinos', CategoryGroup.BEEF],
    ['  Cortes BOVINOS  ', CategoryGroup.BEEF],
    ['Carne bovina', CategoryGroup.BEEF],
    ['Cortes suínos', CategoryGroup.PORK],
    ['Carne suina', CategoryGroup.PORK],
    ['Frango', CategoryGroup.POULTRY],
    ['Aves', CategoryGroup.POULTRY],
    ['Peixes frescos', CategoryGroup.FISH],
    ['Pescados', CategoryGroup.FISH],
    ['Churrasco', CategoryGroup.OTHER],
    ['Bovinos e suínos', CategoryGroup.OTHER],
    ['Caravelas', CategoryGroup.OTHER],
  ])('classifies legacy %s without renaming it', (name, expected) => {
    expect(inferCategoryGroup(name)).toBe(expected);
  });

  it('allows old clients to omit the group and accepts every explicit group', async () => {
    for (const group of [undefined, ...Object.values(CategoryGroup)]) {
      const dto = Object.assign(new CreateCategoryDto(), {
        name: 'Linha especial',
        unit_id: 1,
        group,
      });
      expect(await validate(dto)).toHaveLength(0);
    }
  });

  it.each([null, 'Bovinos', 'INVALID'])(
    'rejects invalid group %s on create and update',
    async (group) => {
      const create = Object.assign(new CreateCategoryDto(), {
        name: 'Linha especial',
        unit_id: 1,
        group,
      });
      const update = Object.assign(new UpdateCategoryDto(), { group });
      expect((await validate(create)).some((error) => error.property === 'group')).toBe(true);
      expect((await validate(update)).some((error) => error.property === 'group')).toBe(true);
    },
  );

  it('allows updates to omit the group, preserving the stored classification', async () => {
    expect(
      await validate(Object.assign(new UpdateCategoryDto(), { name: 'Novo nome' })),
    ).toHaveLength(0);
  });
});
