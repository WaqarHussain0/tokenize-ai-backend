import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import CustomBaseEntity from '@base-classes/base.entity';
import { User } from './user.entity';

@Entity('user_wallets')
export class UserWallet extends CustomBaseEntity {
  @Column({ type: 'varchar', unique: true, length: 100 })
  walletAddress: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  provider: string | null;

  @Column({ type: 'varchar', length: 20, default: 'solana' })
  chain: string;

  @ManyToOne(() => User, (user) => user.wallets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
