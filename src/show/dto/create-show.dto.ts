import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  ValidateNested,
} from 'class-validator';
import { ShowCategory } from '../types/show-category.type';
import { Type } from 'class-transformer';

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

  @IsNumber()
  @IsNotEmpty({ message: '공연장 ID를 입력해주세요.' })
  venueId: number;

  @IsNumber()
  @Max(50000, { message: '가격은 50000 이하이어야 합니다.' })
  @IsNotEmpty({ message: '가격을 입력해주세요.' })
  basePrice: number;

  @IsString()
  @IsNotEmpty({ message: '이미지를 입력해주세요.' })
  img: string;
  // @Type(() => Time)으로 Time 타입의 유효성 검사 가능
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Date)
  @IsNotEmpty({ message: '시간 정보를 입력해주세요.' })
  showTime: Date[];
}
