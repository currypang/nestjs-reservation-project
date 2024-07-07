import { Module } from '@nestjs/common';
import { ShowService } from './show.service';
import { ShowController } from './show.controller';
import { Show } from './entities/shows.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShowTime } from './entities/show_times.entity';
import { Venue } from './entities/venues.entity';
import { Seat } from './entities/seats.entity';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [TypeOrmModule.forFeature([Show, ShowTime, Venue, Seat]), AwsModule],
  providers: [ShowService],
  controllers: [ShowController],
})
export class ShowModule {}
