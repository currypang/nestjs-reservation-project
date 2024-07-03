import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from './entities/shows.entity';
import { Like, Repository } from 'typeorm';
import { Time } from './dto/time.dto';
import { ShowCategory } from './types/show-category.type';
import { GetListQueryDto } from './dto/get-list-query.dto';
import _ from 'lodash';
import { SearchShowsQueryDto } from './dto/search-shows-query.dto';
import { SearchShowParamsDto } from './dto/search-show-params.dto';
import { SeatInfo } from './dto/seat-info.dto';

@Injectable()
export class ShowService {
  constructor(
    @InjectRepository(Show)
    private showRepository: Repository<Show>,
  ) {}
  // 공연 등록 로직
  async createShow(
    name: string,
    description: string,
    category: ShowCategory,
    location: string,
    price: number,
    img: string,
    showTime: Time[],
    seatInfo: SeatInfo[],
  ) {
    const createdShow = await this.showRepository.save({
      name,
      description,
      category,
      location,
      price,
      img,
      showTime,
      seatInfo,
    });
    return createdShow;
  }
  // 공연 목록 조회 로직. query => GetListQueryDto { category: 'Musical' }
  async getList(query: GetListQueryDto) {
    const category = query.category;
    // query 조건 없을 시 모든 목록 조회 - 없을 시 분기처리 삭제 해도 정상동작(find 메서드의 where값이 undefined이면 조건이 없는 것으로 해석)
    if (_.isNil(category)) {
      return await this.showRepository.find();
    } else {
      // 쿼리 조건에 따라 카테고리 별 목록 조회
      return await this.showRepository.find({
        where: { category },
      });
    }
  }
  // 공연 검색 로직 - 검색어 미입력 에러는 dto 파일에서 처리
  async searchShows(query: SearchShowsQueryDto) {
    const searchKeyword = query.search;
    const searchedShows = await this.showRepository.find({
      where: { name: Like(`%${searchKeyword}%`) },
    });
    // 쿼리 조건에 따라 검색 결과 전달, 검색 결과 없을 시 에러 처리 없이 빈 배열로 반환
    return searchedShows;
  }
  // 공연 상세 검색 로직
  async searchShowById(params: SearchShowParamsDto) {
    const { id } = params;
    const searchedShow = await this.showRepository.findOne({
      where: { id },
    });
    // 예매 가능 여부 반환
    const isBookable = searchedShow.seatInfo.some(
      (seat) => seat.remainingSeats > 0,
    );
    searchedShow['isBookable'] = isBookable;
    return searchedShow;
  }
}
