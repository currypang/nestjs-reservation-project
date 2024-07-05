import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservations.entity';
import { DataSource, In, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CreateReservationParamsDto } from './dto/create-reservation-params.dto';
import { Show } from 'src/show/entities/shows.entity';
import { DeleteReservationParamsDto } from './dto/delete-reservation-params.dto';
import { GetVacantSeatsParamsDto } from 'src/reservation/dto/get-vacant-seats-params.dto';
import { GetVacantSeatsDto } from 'src/reservation/dto/get-vacant-seats.dto';
import { Seat } from 'src/show/entities/seats.entity';
import { ShowTime } from 'src/show/entities/show_times.entity';
import { Bookable } from 'src/show/types/bookable.type';
import { CreateReservationDto } from './dto/create-reservation.dto';
import _ from 'lodash';

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
  // 공연 예매 로직(여러 좌석 예매)
  async createReservation(
    user: User,
    params: CreateReservationParamsDto,
    body: CreateReservationDto,
  ) {
    // 트랜잭션 적용
    return this.dataSource.transaction(async (manager) => {
      const { point } = user;
      let totalPoint = 0;
      // 공연, 공연시간, 공연 장소 정보를 갖는 show_times 테이블의 id
      const showTimeId = params.id;
      // 예매할 좌석 정보(배열). lock 적용
      const selectedSeats = await manager.find(Seat, {
        where: {
          id: In(body.seats),
          showTimeId,
        },
        lock: { mode: 'pessimistic_write' },
      });
      // 유효하지 않은 좌석일 경우
      if (selectedSeats.length < body.seats.length) {
        throw new NotFoundException(
          '선택한 좌석 중에 유효하지 않은 좌석이 있습니다.',
        );
      }
      // 이미 예매된 좌석일 경우
      if (
        selectedSeats.some((seat) => seat.bookable === Bookable.IsNotBookable)
      ) {
        throw new ConflictException(
          '선택한 좌석 중에 이미 예매된 좌석이 있습니다.',
        );
      }
      // 총 예매 포인트
      totalPoint = selectedSeats.reduce((acc, cur) => acc + cur.price, 0);
      if (point < totalPoint) {
        // 사용할 유저 포인트가 총 예매 포인트 보다 적을 때
        throw new BadRequestException(
          '보유 중인 포인트가 결제할 포인트 보다 부족합니다.',
        );
      }
      // 유저 포인트 차감
      await manager.update(
        User,
        { id: user.id },
        { point: user.point - totalPoint },
      );
      // 예약한 좌석 예매로 변경
      await manager.update(Seat, body.seats, {
        bookable: Bookable.IsNotBookable,
      });
      // 예약 로그 생성
      const reservation = await manager.save(Reservation, {
        userId: user.id,
        showTimeId: params.id,
        venueId: selectedSeats[0].venueId,
        price: totalPoint,
      });

      return reservation;
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
      if (_.isNil(selectedReservation)) {
        throw new NotFoundException('취소할 예약이 없습니다.');
      }
      // 현재 시간이 공연 시작 3시간 이내 일 때(현재시간이 공연시작 3시간 전 시간보다 늦을 때)에러처리
      const showTime = await manager.findOne(ShowTime, {
        where: {
          id: selectedReservation.showTimeId,
        },
      });
      const currentDate = new Date();
      const reservationDate = showTime.showTime;
      reservationDate.setHours(reservationDate.getHours() - 3);
      console.log(currentDate, reservationDate);
      if (currentDate > reservationDate) {
        throw new ConflictException(
          '공연 시작 3시간 전 까지만 예매를 취소 할 수 있습니다.',
        );
      }
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
        id: true,
        seatNum: true,
        grade: true,
        price: true,
        showTimeId: true,
      },
    });
    return bookableSeats;
  }
}
