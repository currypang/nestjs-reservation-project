import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShowCategory } from '../types/show-category.type';

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
  time: { date: string; time: string }[];

  @Column({ type: 'int', nullable: false })
  seatInfo: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
