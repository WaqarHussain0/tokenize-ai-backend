import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '@requestable-dto/transactions/create-transaction.dto';
import { UserService } from '@modules/user/services/user.service';

import { createMap, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { TransactionResponseDto } from '@transferable-dto/transaction/transaction.response.dto';

@Injectable()
export class TransactionService extends AutomapperProfile {
  constructor(
    @InjectMapper() readonly mapper: Mapper,

    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,

    private readonly userService: UserService,
  ) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, Transaction, TransactionResponseDto);
    };
  }

  async findById(trxId: string) {
    return await this.transactionRepo.findOne({ where: { id: trxId } });
  }

  async getUserTransactions(userId: string) {
    const transactions = await this.transactionRepo.find({ where: { userId } });
    const mappedUsers = this.mapper.mapArray(
      transactions,
      Transaction,
      TransactionResponseDto,
    );

    return mappedUsers;
  }

  async create(payload: CreateTransactionDto) {
    await this.userService.findById(payload.userId);
    const transaction = this.transactionRepo.create(payload);
    return await this.transactionRepo.save(transaction);
  }

  async delete(trxId: string) {
    const trx = await this.findById(trxId);
    await this.transactionRepo.delete(trxId);
    return trx;
  }
}
