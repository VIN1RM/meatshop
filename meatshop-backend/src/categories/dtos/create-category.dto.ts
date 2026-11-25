import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { CategoryGroup } from '../category-group';

export class CreateCategoryDto {
  @ApiPropertyOptional({
    enum: CategoryGroup,
    description: 'Stable marketplace group, independent of the category name',
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(CategoryGroup)
  group?: CategoryGroup;

  @ApiProperty({
    description: 'Category name',
    example: 'Beef',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed category description',
    example: 'Cortes bovinos frescos e resfriados',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    description: 'Indicates whether the category is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    description: 'Unit identifier to which the category belongs',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  unit_id: number;
}
