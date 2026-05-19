import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Transaction signature',
    example:
      '5mufMZmBWb6FPLf95Jc1kTQsJ7qYG61KftgnLpLxtaCt6dJ6eKrYDuFSGJHaEzSwKL8kHA5XczBN3Ff6uCM6M54T',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({
    description: 'Transaction action',
    example: 'Example Transaction Action',
  })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    description: 'Sender of the transaction',
    example: '8wW53bpyMMYtET365jgrowKCwjAG3JT3hCpFzjSbTpQC',
  })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    description: 'Recipient of the transaction',
    example: 'HZck8d6gt9n4B2fam9JGLm2w2hYJKm98iAWw1176QgeB',
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'Amount of the transaction',
    example: '0.04912108',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    description: 'Value of the transaction',
    example: '6.55 $',
  })
  value: string;

  @ApiProperty({
    description: 'User ID associated with the transaction',
    example: '09d927cb-f911-4ace-a069-ff2a935f56b3',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
