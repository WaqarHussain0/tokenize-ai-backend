import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import CustomBaseEntity from '@base-classes/base.entity';
import { User } from './user.entity';
import { AutoMap } from '@automapper/classes';

@Entity('user_wallets')
export class UserWallet extends CustomBaseEntity {
  @Column({ type: 'varchar', unique: true, length: 100 })
  @AutoMap()
  walletAddress: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @AutoMap()
  provider: string | null;

  @Column({ type: 'varchar', length: 20, default: 'solana' })
  @AutoMap()
  chain: string;

  @ManyToOne(() => User, (user) => user.wallets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
