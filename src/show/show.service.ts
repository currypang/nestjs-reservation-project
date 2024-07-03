import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from './entities/shows.entity';
import { Like, Repository } from 'typeorm';
import { Time } from './dto/time.dto';
import { ShowCategory } from './types/show-category.type';
import { GetListQueryDto } from './dto/get-list-query.dto';
import _ from 'lodash';

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
    time: Time[],
    seatInfo: number,
  ) {
    const createdShow = await this.showRepository.save({
      name,
      description,
      category,
      location,
      price,
      img,
      time,
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
  // 공연 검색 로직
  async searchShows(query: any) {
    const searchKeyword = query.search;
    // 검색어 미입력 시
    if (_.isNil(searchKeyword)) {
      throw new BadRequestException('검색어를 입력해 주세요');
    }
    const searchedShows = await this.showRepository.find({
      where: { name: Like(`%${searchKeyword}%`) },
    });
    // 쿼리 조건에 따라 검색 결과 전달, 검색 결과 없을 시 에러 처리 없이 빈 배열로 반환
    return searchedShows;
  }
}
