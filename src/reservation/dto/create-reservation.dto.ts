import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateReservationDto {
  @IsNumber()
  @IsNotEmpty({ message: '공연 시간을 입력해주세요.' })
  showRound: number;

  @IsNumber()
  @IsNotEmpty({ message: '공연 시간을 입력해주세요.' })
  seatCount: number;
}
