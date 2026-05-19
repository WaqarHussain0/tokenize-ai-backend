import { AutoMap } from '@automapper/classes';

export class TransactionResponseDto {
  @AutoMap()
  id: string;

  @AutoMap()
  action: string; // transfer

  @AutoMap()
  from: string;

  @AutoMap()
  to: string;

  @AutoMap()
  amount: string; // 0.04912108

  @AutoMap()
  value: string; // 6.55 $

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  userId: string;
}
