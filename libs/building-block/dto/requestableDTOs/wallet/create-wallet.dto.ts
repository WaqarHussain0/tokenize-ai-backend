import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({
    description: 'Existing user id to attach the wallet to',
    format: 'uuid',
    example: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'On-chain wallet address',
    example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiPropertyOptional({
    description: 'Wallet provider name',
    example: 'phantom',
  })
  @IsOptional()
  @IsString()
  provider?: string;
}
