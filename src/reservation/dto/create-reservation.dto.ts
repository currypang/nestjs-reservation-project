import { IsArray, IsDate, IsNotEmpty, ValidateNested } from 'class-validator';

export class CreateReservationDto {
  @IsDate()
  @IsNotEmpty({ message: '공연 시간을 입력해주세요.' })
  showTime: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @IsNotEmpty({ message: '예매할 좌석을 입력해주세요.' })
  seats: number[];
}
