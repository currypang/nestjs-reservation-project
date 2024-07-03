import { Show } from 'src/show/entities/shows.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
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

  @Column({ type: 'int', name: 'show_id' })
  showId: number;

  @Column({ type: 'json', nullable: false })
  showTime: { showRound: number; time: string };

  @Column({ type: 'varchar', nullable: false })
  location: string;

  @Column({ type: 'int', nullable: false })
  seatCount: number;

  @Column({ type: 'int', nullable: false })
  price: number;

  @ManyToOne(() => User, (user) => user.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Show, (show) => show.reservations)
  @JoinColumn({ name: 'show_id' })
  show: Show;
}
