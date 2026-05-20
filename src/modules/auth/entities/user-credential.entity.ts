import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import CustomBaseEntity from '@base-classes/base.entity';
import { User } from '@modules/user/entities/user.entity';

@Entity('user_credentials')
export class UserCredential extends CustomBaseEntity {
  @Column({
    type: 'varchar',
  })
  token: string;

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  type: string; // type token for ? email verification or reset password

  @Column({ type: 'timestamp', nullable: true, default: null })
  expiry: Date;

  @Column({ type: 'uuid', nullable: true, default: null })
  userId: string;

  @OneToMany(() => User, (user) => user.credential)
  @JoinColumn()
  user: User;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;
}
