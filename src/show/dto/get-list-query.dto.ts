import { IsEnum, IsOptional } from 'class-validator';
import { ShowCategory } from '../types/show-category.type';

export class GetListQueryDto {
  @IsOptional()
  @IsEnum(ShowCategory, { message: '유효한 공연 카테고리를 선택해주세요.' })
  category?: ShowCategory;
}
