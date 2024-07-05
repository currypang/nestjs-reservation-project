import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationService } from './reservation.service';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreateReservationParamsDto } from './dto/create-reservation-params.dto';
import { DeleteReservationParamsDto } from './dto/delete-reservation-params.dto';
import { GetVacantSeatsParamsDto } from 'src/reservation/dto/get-vacant-seats-params.dto';
import { GetVacantSeatsDto } from 'src/reservation/dto/get-vacant-seats.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  // 공연 예매 API
  @Post(':id')
  async createReservation(
    @UserInfo() user: User,
    @Param() params: CreateReservationParamsDto,
    @Body() body: CreateReservationDto,
  ) {
    const reservation = await this.reservationService.createReservation(
      user,
      params,
      body,
    );
    return {
      status: HttpStatus.CREATED,
      message: '예약이 성공하였습니다.',
      data: reservation,
    };
  }
  // 예매 목록 조회 API
  @Get()
  async getReservationList(@UserInfo() user: User) {
    const reservationList =
      await this.reservationService.getReservationList(user);
    return {
      status: HttpStatus.OK,
      message: '예약 목록 조회에 성공하였습니다.',
      data: reservationList,
    };
  }
  // 예매 취소 API
  @Delete(':id')
  async deleteReservation(
    @UserInfo() user: User,
    @Param() params: DeleteReservationParamsDto,
  ) {
    const deletedReservation = await this.reservationService.deleteReservation(
      user,
      params,
    );
    return {
      status: HttpStatus.OK,
      message: '예약 취소에 성공하였습니다.',
      data: deletedReservation,
    };
  }
  // 예매 가능 좌석 확인 API
  @Get('seats/:id')
  async getVacantSeats(
    @Param() params: GetVacantSeatsParamsDto,
    @Body() body: GetVacantSeatsDto,
  ) {
    console.log('11111111');
    const vacantSeats = await this.reservationService.getVacantSeats(
      params,
      body,
    );
    return {
      status: HttpStatus.OK,
      message: '예매 가능 좌석 조회를 성공했습니다.',
      data: vacantSeats,
    };
  }
}
