import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from './entities/shows.entity';
import { DataSource, Like, Repository } from 'typeorm';
import { GetListQueryDto } from './dto/get-list-query.dto';
import _ from 'lodash';
import { SearchShowsQueryDto } from './dto/search-shows-query.dto';
import { SearchShowParamsDto } from './dto/search-show-params.dto';
import { CreateVenueDto } from './dto/create-venue.dto';
import { Venue } from './entities/venues.entity';
import { CreateShowDto } from './dto/create-show.dto';
import { SeatGrade } from './types/seat-grade.type';
import { Seat } from './entities/seats.entity';
import { SEAT_CONSTANT } from 'src/constants/seat.constant';
import { ShowTime } from './entities/show_times.entity';
import { Bookable } from './types/bookable.type';
import { AwsService } from 'src/aws/aws.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ShowService {
  constructor(
    @InjectRepository(Show)
    private showRepository: Repository<Show>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,
    @InjectRepository(ShowTime)
    private showtimeRepository: Repository<ShowTime>,
    private dataSource: DataSource,
    private awsService: AwsService,
  ) {}

  // 공연 등록 로직 - 공연 정보 등록과 함께, 상영되는 공연장 정보를 통해 예매 가능 좌석도 생성(트랜잭션 적용)
  async createShow(createShowDto: CreateShowDto, file: Express.Multer.File) {
    return this.dataSource.transaction(async (manager) => {
      console.log('222222', createShowDto);
      // multer
      const img = await this.imageUpload(file);
      createShowDto['img'] = img;
      // 상영될 공연장 정보
      const { venueId } = createShowDto;
      const selectedVenue = await manager.findOne(Venue, {
        where: { id: venueId },
      });
      // 상영될 공연장 정보가 없을 시 처리
      if (_.isNil(selectedVenue)) {
        throw new NotFoundException(
          '상영되는 공연장 정보가 존재하지 않습니다.',
        );
      }
      // 공연 정보 등록
      const createdShow = await manager.save(Show, createShowDto);
      // 공연 시간 생성
      const createShowTimes = (
        showId: number,
        venueId: number,
        showTimes: Date[],
      ) => {
        const times = [];
        for (let i = 0; i < showTimes.length; i++) {
          times.push(
            manager.create(ShowTime, {
              showId,
              venueId,
              showTime: showTimes[i],
            }),
          );
        }
        return times;
      };
      const createdTimes = createShowTimes(
        createdShow.id,
        createdShow.venueId,
        createdShow.showTime,
      );
      await manager.save(ShowTime, createdTimes);

      // // 공연장 정보를 통해 예매 좌석 생성
      const selectedTimes = await manager.find(ShowTime, {
        where: {
          showId: createdShow.id,
        },
      });
      // 시간 별 예매 좌석 생성
      for (let i = 0; i < selectedTimes.length; i++) {
        //좌석 생성 함수
        const createSeats = (
          venueId: number,
          showTimeId: number,
          seatsNum: number,
          startNum: number,
          grade: SeatGrade,
          additionalPrice: number,
        ) => {
          let seatNum = startNum;
          const seats = [];
          for (let i = 0; i < seatsNum; i++) {
            seats.push(
              manager.create(Seat, {
                venueId,
                showTimeId,
                seatNum: seatNum,
                grade,
                price: createdShow.basePrice + additionalPrice,
              }),
            );
            seatNum++;
          }
          return seats;
        };
        // R석 좌석 생성
        const rSeats = createSeats(
          selectedVenue.id,
          selectedTimes[i].id,
          selectedVenue.rSeatsCount,
          1,
          SeatGrade.R,
          SEAT_CONSTANT.ADDITIONAL_PRICE.R,
        );
        // S석 좌석 생성
        const sSeats = createSeats(
          selectedVenue.id,
          selectedTimes[i].id,
          selectedVenue.sSeatsCount,
          1 + selectedVenue.rSeatsCount,
          SeatGrade.S,
          SEAT_CONSTANT.ADDITIONAL_PRICE.S,
        );
        // A석 좌석 생성
        const aSeats = createSeats(
          selectedVenue.id,
          selectedTimes[i].id,
          selectedVenue.aSeatsCount,
          1 + selectedVenue.rSeatsCount + selectedVenue.sSeatsCount,
          SeatGrade.A,
          SEAT_CONSTANT.ADDITIONAL_PRICE.A,
        );
        // B석 좌석 생성
        const bSeats = createSeats(
          selectedVenue.id,
          selectedTimes[i].id,
          selectedVenue.bSeatsCount,
          1 +
            selectedVenue.rSeatsCount +
            selectedVenue.sSeatsCount +
            selectedVenue.aSeatsCount,
          SeatGrade.B,
          SEAT_CONSTANT.ADDITIONAL_PRICE.B,
        );
        const allSeats = [...rSeats, ...sSeats, ...aSeats, ...bSeats];
        // save 메서드에 배열전달 -> 배열 내 모든 요소 저장
        await manager.save(Seat, allSeats);
      }
      return createdShow;
    });
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
    const showTimes = await this.showtimeRepository.find({
      where: { showId: id },
    });
    const isBookable = await Promise.all(
      showTimes.map(async (showTime) => {
        const bookableSeats = await this.seatRepository.findOne({
          where: { showTimeId: showTime.id, bookable: Bookable.IsBookable },
        });
        if (bookableSeats) {
          return { showTime: showTime.showTime, isBookable: true };
        } else {
          return { showTime: showTime.showTime, isBookable: false };
        }
      }),
    );
    // 시간대 별 예매 가능 여부 리턴 값에 포함
    searchedShow['isBookable'] = isBookable;
    return searchedShow;
  }

  // 공연장 등록 로직
  async createVenue(body: CreateVenueDto) {
    const createdVenue = await this.venueRepository.save(body);
    return createdVenue;
  }
  // 테스트 로직
  // async saveImage(file: Express.Multer.File) {
  //   return await this.imageUpload(file);
  // }

  async imageUpload(file: Express.Multer.File) {
    const imageName = uuidv4();
    const ext = file.originalname.split('.').pop();

    const img = await this.awsService.imageUploadToS3(
      `${imageName}.${ext}`,
      file,
      ext,
    );

    return img;
  }
}
