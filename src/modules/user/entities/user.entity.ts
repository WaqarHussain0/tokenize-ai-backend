import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import CustomBaseEntity from '@base-classes/base.entity';
import { UserCredential } from '@modules/auth/entities/user-credential.entity';
import { AutoMap } from '@automapper/classes';
import { UserProfileResponseDto } from '@transferable-dto/user/profile/user-profile.response.dto';
import { UserReferral } from './user-referrals.entity';
import { KYCSubmission } from '@modules/kyc/entities/kyc-submission.entity';
import { Transaction } from '@modules/transaction/entities/transaction.entity';

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
  s;
  @JoinColumn()
  credential: UserCredential;

  /** Whether the user account is active. */
  @Column({ type: 'boolean', default: true })
  @AutoMap()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  @AutoMap()
  emailVerified: boolean;

  @Column({ type: 'varchar', default: 'investor' })
  @AutoMap()
  role: string;

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
  referrals: UserReferral[];

  @OneToMany(() => KYCSubmission, (kycSubmission) => kycSubmission.user, {
    onDelete: 'CASCADE',
    eager: false,
  })
  kycSubmissions: KYCSubmission[];

  @OneToMany(() => Transaction, (trx) => trx.user, {
    onDelete: 'CASCADE',
    eager: false,
  })
  transactions: Transaction[];
}
