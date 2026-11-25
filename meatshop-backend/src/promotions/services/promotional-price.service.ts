import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import type { CartItem } from '../../cart/entities/cart-item.entity';
import { Promotion } from '../entities/promotion.entity';

export interface IPricedProduct {
  id: number;
  price: number | string;
}

type PromotionDiscount = Pick<Promotion, 'promotional_price' | 'discount_percentage'>;

export function promotionalUnitPrice(basePrice: number, promotion: PromotionDiscount): number {
  const baseCents = Math.round(basePrice * 100);
  const discountedCents =
    promotion.promotional_price != null
      ? Math.round(Number(promotion.promotional_price) * 100)
      : Math.round(
          (baseCents * (10000 - Math.round(Number(promotion.discount_percentage ?? 0) * 100))) /
            10000,
        );
  return Math.min(baseCents, Math.max(0, discountedCents)) / 100;
}

@Injectable()
export class PromotionalPriceService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotions: Repository<Promotion>,
  ) {}

  async currentPrices(
    products: IPricedProduct[],
    manager?: EntityManager,
    at: Date = new Date(),
  ): Promise<Map<number, number>> {
    const basePrices = new Map(products.map((product) => [product.id, Number(product.price)]));
    const prices = new Map(basePrices);
    if (basePrices.size === 0) return prices;
    const active = await this.activePromotions([...basePrices.keys()], at, manager);
    for (const promotion of active) {
      const basePrice = basePrices.get(promotion.product_id);
      if (basePrice === undefined) continue;
      const candidate = promotionalUnitPrice(basePrice, promotion);
      prices.set(promotion.product_id, Math.min(prices.get(promotion.product_id)!, candidate));
    }
    return prices;
  }

  async applyCurrentPrices(items: CartItem[], manager?: EntityManager): Promise<void> {
    const prices = await this.currentPrices(
      items.map((item) => item.product),
      manager,
    );
    for (const item of items) {
      item.unit_price = prices.get(item.product_id) ?? Number(item.product.price);
    }
  }

  private activePromotions(
    productIds: number[],
    at: Date,
    manager?: EntityManager,
  ): Promise<Promotion[]> {
    const repository = manager ? manager.getRepository(Promotion) : this.promotions;
    return repository.find({
      where: {
        product_id: In(productIds),
        active: true,
        starts_at: LessThanOrEqual(at),
        ends_at: MoreThanOrEqual(at),
      },
    });
  }
}
