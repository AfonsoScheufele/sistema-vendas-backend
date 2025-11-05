import { Module } from '@nestjs/common';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';

@Module({
  controllers: [FinanceiroController],
  providers: [FinanceiroService],
  exports: [FinanceiroService],
})
export class FinanceiroModule {}

