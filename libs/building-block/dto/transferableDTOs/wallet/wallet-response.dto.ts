import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Placeholder on-chain summary returned by GET /wallets/:address */
export class WalletResponseDto {
  @ApiProperty({ example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' })
  walletAddress: string;

  @ApiPropertyOptional({
    description: 'Native balance (placeholder until blockchain integration)',
    nullable: true,
    example: null,
  })
  balance: null;

  @ApiProperty({
    description: 'Recent transactions (placeholder)',
    type: 'array',
    items: { type: 'object' },
    example: [],
  })
  transactions: unknown[];

  @ApiProperty({
    description: 'SPL / token holdings (placeholder)',
    type: 'array',
    items: { type: 'object' },
    example: [],
  })
  tokens: unknown[];
}

/** Persisted wallet row returned after POST /wallets */
export class WalletPersistedResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  walletAddress: string;

  @ApiPropertyOptional({ nullable: true })
  provider: string | null;

  @ApiProperty({ example: 'solana' })
  chain: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;
}
