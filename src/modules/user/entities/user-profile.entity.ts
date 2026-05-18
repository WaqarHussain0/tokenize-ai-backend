import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import CustomBaseEntity from '@base-classes/base.entity';
import { AutoMap } from '@automapper/classes';

@Entity('user_profile')
export class UserProfile extends CustomBaseEntity {
  @Column({
    type: 'varchar',
    transformer: {
      to: (value: string) => value?.trim()?.toLowerCase(),
      from: (value: string) => value,
    },
  })
  @AutoMap()
  firstName: string;

  @Column({
    type: 'varchar',
    transformer: {
      to: (value: string) => value?.trim()?.toLowerCase(),
      from: (value: string) => value,
    },
  })
  @AutoMap()
  lastName: string;

  @Column({ type: 'varchar', nullable: true, length: 40, default: '' })
  @AutoMap()
  contact: string;

  @Column({ type: 'varchar', nullable: true, length: 20, default: null })
  @AutoMap()
  country: string | null;

  @Column({ type: 'uuid', default: null })
  @AutoMap()
  userId: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;

  // only filled for company-role users
  @Column({ type: 'text', nullable: true, default: '' })
  @AutoMap()
  companyName: string;

  @Column({ type: 'varchar', nullable: true, default: '' })
  @AutoMap()
  companyRegNo: string;
}
