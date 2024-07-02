import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from './entities/shows.entity';
import { Repository } from 'typeorm';
import { Time } from './dto/time.dto';
import { ShowCategory } from './types/show-category.type';

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
}
