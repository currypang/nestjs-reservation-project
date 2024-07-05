import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class GetVacantSeatsDto {
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty({ message: '공연 시각을 입력해주세요.' })
  showTime: Date;
}
