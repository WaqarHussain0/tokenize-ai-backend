import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokenDto {
  @ApiProperty({
    description: 'Token for email verification',
    example: '7fa03e297c42f5dbf97dddcca867e8',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
