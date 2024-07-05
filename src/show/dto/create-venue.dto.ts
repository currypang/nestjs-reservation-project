import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { VenueType } from '../types/venue.type';

export class CreateVenueDto {
  @IsString()
  @IsNotEmpty({ message: '공연장 이름을 입력해주세요.' })
  name: string;

  @IsEnum(VenueType, { message: '적합하지 않은 공연장 카테고리입니다.' })
  @IsNotEmpty({ message: '공연장 카테고리를 입력해주세요.' })
  category: VenueType;

  @IsNumber()
  @IsNotEmpty({ message: '전체 좌석 수를 입력해주세요.' })
  totalSeats: number;

  @IsNumber()
  @IsNotEmpty({ message: 'R등급 좌석 수를 입력해주세요.' })
  rSeatsCount: number;

  @IsNumber()
  @IsNotEmpty({ message: 'S등급 좌석 수를 입력해주세요.' })
  sSeatsCount: number;

  @IsNumber()
  @IsNotEmpty({ message: 'A등급 좌석 수를 입력해주세요.' })
  aSeatsCount: number;

  @IsNumber()
  @IsNotEmpty({ message: 'B등급 좌석 수를 입력해주세요.' })
  bSeatsCount: number;
}
