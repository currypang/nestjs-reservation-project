import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class Time {
  @IsNumber()
  @IsNotEmpty({ message: '회차를 입력해주세요.' })
  showRound: number;

  @IsString()
  @IsNotEmpty({ message: '공연 시간을 입력해주세요.' })
  time: string;
}
