import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { Public } from '@modules/auth/decorators';
import { JwtAuthGuard } from '@modules/auth/guards';
import { TransactionService } from '../services/transaction.service';
import { CreateTransactionDto } from '@requestable-dto/transactions/create-transaction.dto';

@ApiTags('Transaction')
@Controller('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Public()
  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user whose transactions are being retrieved',
    required: true,
    example: '09d927cb-f911-4ace-a069-ff2a935f56b3',
  })
  @ApiOperation({
    summary: 'Get user transactions',
    description: 'Retrieves the transaction history for a specific user',
  })
  async getTransactions(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return await this.transactionService.getUserTransactions(userId);
  }

  @Post('')
  @Public()
  @ApiOperation({
    summary: 'Create transaction',
    description: 'Create a new transaction with the provided details',
  })
  @ApiBody({
    type: CreateTransactionDto,
    description: 'Transaction creation details',
  })
  async create(@Body() payload: CreateTransactionDto) {
    return await this.transactionService.create(payload);
  }
}
