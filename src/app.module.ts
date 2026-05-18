import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from '../config/index';
import { UserModule } from '@modules/user/user.module';
import AuthModule from '@modules/auth/auth.module';

import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { PatentModule } from '@modules/patent/patent.module';
import AppSharedModule from '@modules/app-shared/app-shared.module';
import { WalletModule } from '@modules/wallet/wallet.module';

@Module({
  imports: [
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env`],
      load: [appConfig],
    }),

    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          ...configService.get('database'),
        };
      },
    }),

    UserModule,
    AuthModule,
    PatentModule,
    AppSharedModule,
    WalletModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
