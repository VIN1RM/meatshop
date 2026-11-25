import type { MigrationInterface, QueryRunner } from 'typeorm';
import { CategoryGroup, inferCategoryGroup } from '../../categories/category-group';

export class CategoryGroups1794560000000 implements MigrationInterface {
  async up(query: QueryRunner): Promise<void> {
    await query.query(
      `ALTER TABLE categories ADD COLUMN "group" varchar(16) NOT NULL DEFAULT 'OTHER'`,
    );
    await query.query(
      `ALTER TABLE categories ADD CONSTRAINT categories_group_check CHECK ("group" IN ('BEEF','PORK','POULTRY','FISH','OTHER'))`,
    );
    const categories: { id: number; name: string }[] = await query.query(
      'SELECT id, name FROM categories',
    );
    for (const category of categories) {
      const group = inferCategoryGroup(category.name);
      if (group !== CategoryGroup.OTHER)
        await query.query('UPDATE categories SET "group" = $1 WHERE id = $2', [group, category.id]);
    }
  }

  async down(query: QueryRunner): Promise<void> {
    await query.query('ALTER TABLE categories DROP COLUMN "group"');
  }
}
