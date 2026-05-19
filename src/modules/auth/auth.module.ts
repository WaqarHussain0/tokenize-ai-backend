import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { UserModule } from '@modules/user/user.module';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from './guards';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCredential } from './entities/user-credential.entity';
import { UserCredentialService } from './services/user-credential.service';
import AppSharedModule from '@modules/app-shared/app-shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCredential]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          ...configService.get('jwt'),
        };
      },
    }),

    forwardRef(() => UserModule),
    forwardRef(() => AppSharedModule),
  ],

  providers: [AuthService, JwtAuthGuard, UserCredentialService],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, UserCredentialService],
})
export default class AuthModule {}
