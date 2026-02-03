import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('otps')
@Index(['email', 'type'])
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  otp: string;

  @Column()
  type: string; // 'VERIFY_EMAIL' or 'RESET_PASSWORD'

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}