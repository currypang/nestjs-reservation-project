import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteReservationParamsDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: '예약 로그 ID를 입력해주세요.' })
  id: number;
}
