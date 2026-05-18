import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import CustomBaseEntity from '@base-classes/base.entity';
import { UserCredential } from '@modules/auth/entities/user-credential.entity';
import { AutoMap } from '@automapper/classes';
import { UserProfileResponseDto } from '@transferable-dto/user/profile/user-profile.response.dto';
import { UserKYCStatusEnum } from '@enums/user/user.enum';
import { UserReferral } from './user-referrals.entity';
import { UserWallet } from './user-wallet.entity';

@Entity('users')
export class User extends CustomBaseEntity {
  @Column({
    type: 'varchar',
    unique: true,
    length: 320,
    transformer: {
      to: (value: string) => value?.trim()?.toLowerCase(),
      from: (value: string) => value,
    },
  })
  @AutoMap()
  email: string;

  @Column({
    type: 'varchar',
  })
  password: string;

  @Column({
    type: 'enum',
    enum: UserKYCStatusEnum,
    default: UserKYCStatusEnum.PENDING,
  })
  @AutoMap()
  kycStatus: UserKYCStatusEnum;

  @OneToOne(() => UserProfile, (profile) => profile.user, {
    eager: false,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @AutoMap(() => UserProfileResponseDto)
  profile: UserProfile;

  @OneToOne(() => UserCredential, (credential) => credential.user, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  credential: UserCredential;

  /** Whether the user account is active. */
  @Column({ type: 'boolean', default: true })
  @AutoMap()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  @AutoMap()
  emailVerified: boolean;

  /**
   * Unique referral code owned by this user.
   * Used in signup links like: ?ref=ABC123
   */
  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
    default: null,
    length: 20,
  })
  @AutoMap()
  referralCode: string;

  /**
   * Referrals made by this user (people they invited)
   * Back-reference from referral table
   */

  @OneToMany(() => UserReferral, (ref) => ref.referredByUser)
  sentReferrals: UserReferral[];

  @OneToMany(() => UserWallet, (wallet) => wallet.user)
  wallets: UserWallet[];
  referrals: UserReferral[];
}
