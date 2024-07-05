import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Show } from './shows.entity';
import { Seat } from './seats.entity';
import { Reservation } from 'src/reservation/entities/reservations.entity';

@Entity({
  name: 'show_times',
})
export class ShowTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'show_id' })
  showId: number;

  @Column({ type: 'int', name: 'venue_id' })
  venueId: number;

  @Column({ type: 'timestamp', name: 'show_time' })
  showTime: Date;

  @ManyToOne(() => Show, (show) => show.showTimes)
  @JoinColumn({ name: 'show_id' })
  show: Show;

  @OneToMany(() => Seat, (seat) => seat.showTime)
  seats: Seat[];

  @OneToMany(() => Reservation, (reservation) => reservation.showTime)
  reservations: Reservation[];
}
