import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SaveUserWalletDto {
  @ApiProperty({
    description: 'Public wallet address',
    example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  walletAddress: string;

  @ApiProperty({
    description: 'Wallet provider (e.g. phantom)',
    example: 'phantom',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  provider: string;

  @ApiProperty({
    description: 'User ID associated with the transaction',
    example: '09d927cb-f911-4ace-a069-ff2a935f56b3',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
