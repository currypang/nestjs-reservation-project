import { IsNotEmpty, IsString } from 'class-validator';

export class SearchShowsQueryDto {
  @IsString()
  @IsNotEmpty({ message: '검색어를 입력해주세요.' })
  search: string;
}
