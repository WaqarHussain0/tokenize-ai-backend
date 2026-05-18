import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserWallet } from '@modules/user/entities/user-wallet.entity';
import { CreateWalletDto } from '@requestable-dto/wallet/create-wallet.dto';
import {
  WalletPersistedResponseDto,
  WalletResponseDto,
} from '@transferable-dto/wallet/wallet-response.dto';
import { UserService } from '@modules/user/services/user.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(UserWallet)
    private readonly walletRepo: Repository<UserWallet>,
    private readonly userService: UserService,
  ) {}

  async create(payload: CreateWalletDto): Promise<WalletPersistedResponseDto> {
    const { userId, walletAddress, provider } = payload;

    await this.userService.findById(userId, false);

    const existing = await this.walletRepo.findOne({
      where: { walletAddress: walletAddress.trim() },
    });

    if (existing) {
      throw new ConflictException(
        `Wallet with address ${walletAddress} is already registered.`,
      );
    }

    const wallet = this.walletRepo.create({
      walletAddress: walletAddress.trim(),
      provider: provider?.trim() ?? null,
      user: { id: userId },
    });

    const saved = await this.walletRepo.save(wallet);

    return {
      id: saved.id,
      walletAddress: saved.walletAddress,
      provider: saved.provider,
      chain: saved.chain,
      userId,
    };
  }

  async getPublicInfoByAddress(address: string): Promise<WalletResponseDto> {
    const trimmed = address.trim();
    const wallet = await this.walletRepo.findOne({
      where: { walletAddress: trimmed },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with address ${trimmed} not found.`);
    }

    const dto = new WalletResponseDto();
    dto.walletAddress = wallet.walletAddress;
    dto.balance = null;
    dto.transactions = [];
    dto.tokens = [];
    return dto;
  }
}
