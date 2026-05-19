import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import CustomBaseEntity from '@base-classes/base.entity';
import { User } from '@modules/user/entities/user.entity';
import { AutoMap } from '@automapper/classes';

@Entity('transactions')
export class Transaction extends CustomBaseEntity {
  @Column({ type: 'text', default: null })
  @AutoMap()
  signature: string;

  @Column({ type: 'varchar', default: null })
  @AutoMap()
  action: string; // transfer

  @Column({ type: 'text', default: null })
  @AutoMap()
  from: string;

  @Column({ type: 'text', default: null })
  @AutoMap()
  to: string;

  @Column({ type: 'varchar', default: null })
  @AutoMap()
  amount: string; // 0.04912108

  @Column({ type: 'varchar', default: null })
  @AutoMap()
  value: string; // 6.55 $

  @Column({ type: 'uuid', default: null })
  @AutoMap()
  userId: string;

  @ManyToOne(() => User, (user) => user.transactions, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
