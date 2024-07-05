import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShowCategory } from '../types/show-category.type';
import { Reservation } from 'src/reservation/entities/reservations.entity';
import { ShowTime } from './show_times.entity';
import { Venue } from './venues.entity';

@Entity({
  name: 'shows',
})
export class Show {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  description: string;

  @Column({
    type: 'enum',
    enum: ShowCategory,
    nullable: false,
    default: ShowCategory.None,
  })
  category: ShowCategory;

  @Column({ type: 'int', name: 'venue_id' })
  venueId: number;

  @Column({ type: 'int', nullable: false })
  basePrice: number;

  @Column({ type: 'varchar' })
  img: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    precision: 6,
  })
  updatedAt: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.show)
  reservations: Reservation[];

  @OneToMany(() => ShowTime, (showTime) => showTime.show)
  showTimes: ShowTime[];

  @ManyToOne(() => Venue, (venue) => venue.shows)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;
}
