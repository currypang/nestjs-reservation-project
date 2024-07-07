import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
} from 'class-validator';
import { ShowCategory } from '../types/show-category.type';
import { Transform, Type } from 'class-transformer';

export class CreateShowDto {
  @IsString()
  @IsNotEmpty({ message: '공연 이름을 입력해주세요.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '공연 설명을 입력해주세요.' })
  description: string;

  @IsEnum(ShowCategory, { message: '유효한 공연 카테고리를 선택해주세요.' })
  @IsNotEmpty({ message: '공연 카테고리를 입력해주세요.' })
  category: ShowCategory;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: '공연장 ID를 입력해주세요.' })
  venueId: number;

  @Type(() => Number)
  @IsNumber()
  @Max(50000, { message: '가격은 50000 이하이어야 합니다.' })
  @IsNotEmpty({ message: '가격을 입력해주세요.' })
  basePrice: number;

  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  @IsArray({ message: 'showTime must be an array' })
  @IsNotEmpty({ message: '시간 정보를 입력해주세요.' })
  showTime: Date[];
}
