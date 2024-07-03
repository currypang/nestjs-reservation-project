import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservations.entity';
import { Show } from 'src/show/entities/shows.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Show, User])],
  providers: [ReservationService],
  controllers: [ReservationController],
})
export class ReservationModule {}
