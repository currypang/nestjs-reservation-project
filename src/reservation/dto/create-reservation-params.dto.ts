import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateReservationParamsDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: '공연 ID를 입력해주세요.' })
  id: number;
}
