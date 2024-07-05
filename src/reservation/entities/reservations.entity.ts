import { ShowTime } from 'src/show/entities/show_times.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'reservations',
})
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @Column({ type: 'int', name: 'show_time_id' })
  showTimeId: number;

  @Column({ type: 'int', name: 'venue_id' })
  venueId: number;

  @Column({ type: 'int', nullable: false })
  price: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ShowTime, (showTime) => showTime.reservations)
  @JoinColumn({ name: 'show_time_id' })
  showTime: ShowTime;
}
