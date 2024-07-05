import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SeatGrade } from '../types/seat-grade.type';
import { Venue } from './venues.entity';
import { ShowTime } from './show_times.entity';
import { Bookable } from '../types/bookable.type';

@Entity({
  name: 'seats',
})
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'venue_id' })
  venueId: number;

  @Column({ type: 'int', name: 'show_time_id' })
  showTimeId: number;

  @Column({ type: 'int', nullable: false })
  seatNum: number;

  @Column({ type: 'enum', enum: SeatGrade })
  grade: SeatGrade;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'enum', enum: Bookable, default: Bookable.IsBookable })
  bookable: Bookable;

  @ManyToOne(() => Venue, (venue) => venue.seats)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @ManyToOne(() => ShowTime, (showTime) => showTime.seats)
  @JoinColumn({ name: 'show_time_id' })
  showTime: ShowTime;
}
