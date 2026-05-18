import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import CustomBaseEntity from '@base-classes/base.entity';
import { User } from '@modules/user/entities/user.entity';
import { AutoMap } from '@automapper/classes';

@Entity('kyc_submissions')
export class KYCSubmission extends CustomBaseEntity {
  @Column({
    type: 'varchar',
  })
  @AutoMap()
  status: string;

  @Column({
    type: 'varchar',
  })
  @AutoMap()
  provider: string; //sumsub

  @Column({ type: 'uuid', default: null })
  @AutoMap()
  userId: string;

  @ManyToOne(() => User, (user) => user.kycSubmissions, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'text',
    nullable: true,
    default: '',
  })
  @AutoMap()
  rejectionReason: string;
}
