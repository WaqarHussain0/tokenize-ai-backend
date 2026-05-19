import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { UserProfile } from './entities/user-profile.entity';
import { UserController } from './controllers/user.controller';
import { UserProfileController } from './controllers/user-profile.controller';
import { UserProfileService } from './services/user-profile.service';
import AuthModule from '@modules/auth/auth.module';
import AppSharedModule from '@modules/app-shared/app-shared.module';
import { UserReferral } from './entities/user-referrals.entity';
import { UserReferralService } from './services/user-referrals.service';
import { UserReferralController } from './controllers/user-referrals.controller';
import { UserCredential } from '@modules/auth/entities/user-credential.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, UserReferral, UserCredential]),
    AppSharedModule,
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, UserProfileService, UserReferralService],
  exports: [UserService, UserProfileService],
  controllers: [UserController, UserProfileController, UserReferralController],
})
export class UserModule {}
