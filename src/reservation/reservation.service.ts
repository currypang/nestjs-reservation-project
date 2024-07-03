import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservations.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CreateReservationParamsDto } from './dto/create-reservation-params.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Show } from 'src/show/entities/shows.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Show)
    private showRepository: Repository<Show>,
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
      const selectedShow = show.seatInfo.find(
        (showTime) => showTime.showRound === createReservationDto.showRound,
      );
      // 해당 회차의 공연이 매진일 때
      if (selectedShow.remainingSeats === 0) {
        throw new ConflictException('해당 회차의 공연은 매진되었습니다.');
      }
      // 해당 회차의 잔여 좌석 수가 예매 하려는 티켓 수보다 적을 때
      if (selectedShow.remainingSeats < createReservationDto.seatCount) {
        throw new ConflictException('예매할 표의 수보다 잔여 좌석이 적습니다.');
      }
      // 사용할 유저포인트가 구매 금액보다 적을 때
      const totalPrice = show.price * createReservationDto.seatCount;
      if (user.point < totalPrice) {
        throw new ConflictException('보유한 포인트가 구매 금액보다 적습니다.');
      }

      // 유저 포인트 차감
      await manager.update(
        User,
        { id: user.id },
        { point: user.point - totalPrice },
      );
      // 예약한 표의 수만큼 좌석 차감
      selectedShow.remainingSeats =
        selectedShow.remainingSeats - createReservationDto.seatCount;
      delete show.updatedAt;
      await manager.save(Show, show);
      // 예약 로그 생성
      const reservation = await manager.save(Reservation, {
        userId: user.id,
        showId: params.id,
        showTime: show.showTime[createReservationDto.showRound - 1],
        location: show.location,
        seatCount: createReservationDto.seatCount,
        price: totalPrice,
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
}
