import { jest } from '@jest/globals';
import { UpdatePromotionUseCase } from './update-promotion.use-case';
import type { Promotion } from '../entities/promotion.entity';

describe('Changing promotion discount mode', () => {
  function setup() {
    const promotion = {
      id: 1,
      unit_id: 1,
      discount_percentage: null,
      promotional_price: 80,
      product: { price: 100 },
      starts_at: new Date('2099-01-01'),
      ends_at: new Date('2099-02-01'),
    } as Promotion;
    const repository = {
      findOne: jest.fn(async () => promotion),
      save: jest.fn(async () => promotion),
    };
    const service = new UpdatePromotionUseCase(
      repository as never,
      { assertHasPermission: jest.fn() } as never,
    );
    return { service, repository, promotion };
  }
  it('clears the previous explicit price when switching to a percentage', async () => {
    const { service } = setup();
    await expect(
      service.execute(1, { discount_percentage: 12.5 }, { id: 1 } as never),
    ).resolves.toMatchObject({ discount_percentage: 12.5, promotional_price: null });
  });
  it('preserves the mode on metadata-only changes', async () => {
    const { service } = setup();
    await expect(
      service.execute(1, { title: 'Novo título' }, { id: 1 } as never),
    ).resolves.toMatchObject({ discount_percentage: null, promotional_price: 80 });
  });
  it('rejects conflicting discounts and prices above the original without saving', async () => {
    const { service, repository } = setup();
    await expect(
      service.execute(1, { discount_percentage: 10, promotional_price: 90 }, { id: 1 } as never),
    ).rejects.toThrow();
    await expect(
      service.execute(1, { promotional_price: 101 }, { id: 1 } as never),
    ).rejects.toThrow();
    expect(repository.save).not.toHaveBeenCalled();
  });
});
