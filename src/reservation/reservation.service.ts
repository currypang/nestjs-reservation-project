import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservations.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CreateReservationParamsDto } from './dto/create-reservation-params.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Show } from 'src/show/entities/shows.entity';
import { DeleteReservationParamsDto } from './dto/delete-reservation-params.dto';
import { GetVacantSeatsParamsDto } from 'src/reservation/dto/get-vacant-seats-params.dto';
import { GetVacantSeatsDto } from 'src/reservation/dto/get-vacant-seats.dto';
import { Seat } from 'src/show/entities/seats.entity';
import { ShowTime } from 'src/show/entities/show_times.entity';
import { Bookable } from 'src/show/types/bookable.type';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Show)
    private showRepository: Repository<Show>,
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,
    @InjectRepository(ShowTime)
    private showTimeRepository: Repository<ShowTime>,
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}
  // 공연 예매 로직
  async createReservation(
    user: User,
    params: CreateReservationParamsDto,
    createReservationDto: CreateReservationDto,
  ) {
    // 트랜잭션 적용
    return this.dataSource.transaction(async (manager) => {
      const show = await manager.findOne(Show, {
        where: { id: params.id },
      });
      // 예약할 공연의 회차와 좌석 수
      // 해당 회차의 공연이 매진일 때
      // 해당 회차의 잔여 좌석 수가 예매 하려는 티켓 수보다 적을 때
      // 사용할 유저포인트가 구매 금액보다 적을 때
      // 유저 포인트 차감
      // 예약한 표의 수만큼 좌석 차감
      // 예약 로그 생성
      console.log(user, show);
      return createReservationDto;
    });
  }
  // 예약 목록 조회 로직
  async getReservationList(user: User) {
    const reservationList = await this.reservationRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });
    return reservationList;
  }
  // 예약 취소 로직
  async deleteReservation(user: User, params: DeleteReservationParamsDto) {
    // 트랜지션 사용
    return this.dataSource.transaction(async (manager) => {
      const selectedReservation = await manager.findOne(Reservation, {
        where: { userId: user.id, id: params.id },
      });
      // 해당되는 예약 없을 시 처리
      // 현재 시간이 공연 시작 3시간 이내 일 때(현재시간이 공연시작 3시간 전 시간보다 늦을 때)에러처리
      // 유저 포인트 환불
      const refundedPoint = user.point + selectedReservation.price;
      await manager.save(User, { id: user.id, point: refundedPoint });
      // 예매 정보 삭제. softDelete 사용
      await manager.softDelete(Reservation, params.id);
      return { id: params.id };
    });
  }
  // 예매 가능 좌석 정보 로직
  async getVacantSeats(
    params: GetVacantSeatsParamsDto,
    body: GetVacantSeatsDto,
  ) {
    const showTime = await this.showTimeRepository.findOne({
      where: { showId: params.id, showTime: body.showTime },
    });
    const bookableSeats = await this.seatRepository.find({
      where: {
        venueId: showTime.venueId,
        showTimeId: showTime.id,
        bookable: Bookable.IsBookable,
      },
      select: {
        seatNum: true,
        grade: true,
        price: true,
      },
    });
    return bookableSeats;
  }
}
