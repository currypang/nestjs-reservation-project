import { IsString, IsNotEmpty } from 'class-validator';

export class Time {
  @IsString()
  @IsNotEmpty({ message: '날짜를 입력해주세요.' })
  date: string;

  @IsString()
  @IsNotEmpty({ message: '시간을 입력해주세요.' })
  time: string;
}
