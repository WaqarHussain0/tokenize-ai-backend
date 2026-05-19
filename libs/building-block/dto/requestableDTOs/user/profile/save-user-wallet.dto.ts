import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class SaveUserWalletDto {
  @ApiProperty({
    description: 'Public wallet address',
    example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  walletAddress: string;

  @ApiPropertyOptional({
    description: 'Wallet provider (e.g. phantom)',
    example: 'phantom',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  provider?: string;
}
