import { ArrayMinSize, ArrayNotEmpty, IsNumber } from 'class-validator';

export class CreateReservationDto {
  @ArrayNotEmpty({ message: '예매할 좌석을 입력해주세요.' })
  @ArrayMinSize(1, { message: '적어도 하나 이상의 좌석을 입력해주세요.' })
  @IsNumber({}, { each: true, message: '좌석 ID는 숫자여야 합니다.' })
  seats: number[];
}
