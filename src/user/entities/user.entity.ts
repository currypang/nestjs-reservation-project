import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../types/user-role.type';
import { Token } from './tokens.entity';
import { Reservation } from 'src/reservation/entities/reservations.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  nickname: string;

  @Column({ type: 'varchar', select: false, nullable: false })
  password: string;

  @Column({ type: 'int', nullable: false, default: 1000000 })
  point: number;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @OneToOne(() => Token, (token) => token.user)
  token: Token;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];
}
