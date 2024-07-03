import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShowService } from './show.service';
import { CreateShowDto } from './dto/create-show.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/user/types/user-role.type';
import { GetListQueryDto } from './dto/get-list-query.dto';
import { SearchShowsQueryDto } from './dto/search-shows-query.dto';
import { SearchShowParamsDto } from './dto/search-show-params.dto';

@UseGuards(RolesGuard)
@Controller('show')
export class ShowController {
  constructor(private readonly showService: ShowService) {}
  // 공연 등록 API
  @Roles(Role.Admin)
  @Post()
  // CreateShowDto 타입의 req.body 값을 createShowDto 변수에 담는다.
  async createShow(@Body() createShowDto: CreateShowDto) {
    const createdShow = await this.showService.createShow(
      createShowDto.name,
      createShowDto.description,
      createShowDto.category,
      createShowDto.location,
      createShowDto.price,
      createShowDto.img,
      createShowDto.time,
      createShowDto.seatInfo,
    );
    return {
      status: HttpStatus.CREATED,
      message: '공연 등록이 성공하였습니다.',
      data: createdShow,
    };
  }
  // 공연 목록 조회 API
  @Get('list')
  async getShowList(@Query() query: GetListQueryDto) {
    const list = await this.showService.getList(query);
    return {
      status: HttpStatus.OK,
      message: '공연 목록 조회를 성공했습니다.',
      data: list,
    };
  }
  // 공연 검색 API
  @Get()
  async searchShows(@Query() query: SearchShowsQueryDto) {
    const searchedShows = await this.showService.searchShows(query);
    return {
      status: HttpStatus.OK,
      message: '공연 검색 조회를 성공했습니다.',
      data: searchedShows,
    };
  }
  // 공연 상세 검색 API. @Params('id') 대신 @Param()을 사용하여 전체 파라미터 객체를 DTO로 변환하고 타입 검증을 수행
  @Get('details/:id')
  async searchShowById(@Param() params: SearchShowParamsDto) {
    const searchedShow = await this.showService.searchShowById(params);
    return {
      status: HttpStatus.OK,
      message: '공연 상세 조회를 성공했습니다.',
      data: searchedShow,
    };
  }
}
