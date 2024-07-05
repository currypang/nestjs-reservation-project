import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Show } from './shows.entity';
import { Seat } from './seats.entity';
import { VenueType } from '../types/venue.type';

@Entity({
  name: 'venues',
})
export class Venue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'enum', enum: VenueType, nullable: false })
  category: VenueType;

  @Column({ type: 'int', name: 'total_seats' })
  totalSeats: number;

  @Column({ type: 'int', name: 'r_seats_count' })
  rSeatsCount: number;

  @Column({ type: 'int', name: 's_seats_count' })
  sSeatsCount: number;

  @Column({ type: 'int', name: 'a_seats_count' })
  aSeatsCount: number;

  @Column({ type: 'int', name: 'b_seats_count' })
  bSeatsCount: number;

  @OneToMany(() => Show, (show) => show.venue)
  shows: Show[];

  @OneToMany(() => Seat, (seat) => seat.venue)
  seats: Seat[];
}
