import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShowCategory } from '../types/show-category.type';
import { Reservation } from 'src/reservation/entities/reservations.entity';

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

  @Column({ type: 'varchar', nullable: false })
  location: string;

  @Column({ type: 'int', nullable: false })
  price: number;

  @Column({ type: 'varchar' })
  img: string;

  @Column({ type: 'json', nullable: false })
  showTime: { showRound: number; time: string }[];

  @Column({ type: 'json', nullable: false })
  seatInfo: { showRound: number; remainingSeats: number }[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    precision: 6,
  })
  updatedAt: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.show)
  reservations: Reservation[];
}
