import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from './entities/shows.entity';
import { Repository } from 'typeorm';
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
    // query 조건 없을 시 모든 목록 조회
    if (_.isNil(category)) {
      return await this.showRepository.find();
    } else {
      // 쿼리 조건에 따라 카테고리 별 목록 조회
      return await this.showRepository.find({
        where: { category },
      });
    }
  }
}
