import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards';
import { Public } from '@modules/auth/decorators';
import { WalletService } from '../services/wallet.service';
import { CreateWalletDto } from '@requestable-dto/wallet/create-wallet.dto';
import {
  WalletPersistedResponseDto,
  WalletResponseDto,
} from '@transferable-dto/wallet/wallet-response.dto';

@ApiTags('User Wallet')
@Controller('wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a wallet for a user',
    description: 'Saves a wallet address against an existing user account.',
  })
  @ApiBody({ type: CreateWalletDto })
  async create(
    @Body() payload: CreateWalletDto,
  ): Promise<WalletPersistedResponseDto> {
    return this.walletService.create(payload);
  }

  @Public()
  @Get(':address')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'address',
    description: 'Stored wallet address to summarize',
    required: true,
  })
  @ApiOperation({
    summary: 'Get public wallet summary',
    description:
      'Returns blockchain-oriented public info for a wallet known to the system (placeholder until RPC integration).',
  })
  async getByAddress(
    @Param('address') address: string,
  ): Promise<WalletResponseDto> {
    return this.walletService.getPublicInfoByAddress(address);
  }
}
