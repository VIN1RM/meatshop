import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitPermission } from '../../common/enums/unit-permission.enum';
import { UnitAuthorizationService } from '../../units/services/unit-authorization.service';
import { User } from '../../users/entities/user.entity';
import { UpdatePromotionDto } from '../dtos/update-promotion.dto';
import { assertPromotionValues } from '../services/promotion-values';
import { Promotion } from '../entities/promotion.entity';

@Injectable()
export class UpdatePromotionUseCase {
  private readonly logger = new Logger(UpdatePromotionUseCase.name);

  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    private readonly unitAuthorizationService: UnitAuthorizationService,
  ) {}

  async execute(
    promotionId: number,
    dto: UpdatePromotionDto,
    currentUser: User,
  ): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id: promotionId },
      relations: ['product'],
    });
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    await this.unitAuthorizationService.assertHasPermission(
      currentUser,
      promotion.unit_id,
      UnitPermission.MANAGE_PRODUCTS,
    );

    const startsAt = dto.starts_at ? new Date(dto.starts_at) : promotion.starts_at;
    const endsAt = dto.ends_at ? new Date(dto.ends_at) : promotion.ends_at;
    if (endsAt <= startsAt) {
      throw new BadRequestException('ends_at must be after starts_at');
    }

    const percentage =
      dto.discount_percentage !== undefined
        ? dto.discount_percentage
        : dto.promotional_price != null
          ? null
          : promotion.discount_percentage;
    const price =
      dto.promotional_price !== undefined
        ? dto.promotional_price
        : dto.discount_percentage != null
          ? null
          : promotion.promotional_price;
    assertPromotionValues(percentage, price, Number(promotion.product?.price));
    Object.assign(promotion, dto, {
      starts_at: startsAt,
      ends_at: endsAt,
      discount_percentage: percentage,
      promotional_price: price,
    });
    await this.promotionRepository.save(promotion);

    this.logger.log(`Promotion ${promotion.id} updated by user ${currentUser.id}`);

    return promotion;
  }
}
