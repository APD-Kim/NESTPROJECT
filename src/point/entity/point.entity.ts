import { User } from '../../user/entity/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Point {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  point: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.point)
  @JoinColumn({ name: 'userId' })
  user: User;
}
