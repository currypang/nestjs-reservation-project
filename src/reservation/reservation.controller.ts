import {
  Body,
  Controller,
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
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  // 공연 예매 API
  @UseGuards(AuthGuard('jwt'))
  @Post(':id')
  async createReservation(
    @UserInfo() user: User,
    @Param() params: CreateReservationParamsDto,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    const reservation = await this.reservationService.createReservation(
      user,
      params,
      createReservationDto,
    );
    return {
      status: HttpStatus.CREATED,
      message: '예약이 성공하였습니다.',
      data: reservation,
    };
  }
}
