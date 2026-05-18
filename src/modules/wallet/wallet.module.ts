import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserWallet } from '@modules/user/entities/user-wallet.entity';
import { UserModule } from '@modules/user/user.module';
import AuthModule from '@modules/auth/auth.module';
import { WalletService } from './services/wallet.service';
import { WalletController } from './controllers/wallet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserWallet]), UserModule, AuthModule],
  providers: [WalletService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
