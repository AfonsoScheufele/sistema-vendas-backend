import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroService } from './financeiro.service';
import { FinanceiroController } from './financeiro.controller';
import { Banco } from './banco.entity';
import { MovimentacaoFinanceira } from './movimentacao-financeira.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banco, MovimentacaoFinanceira])],
  controllers: [FinanceiroController],
  providers: [FinanceiroService],
  exports: [FinanceiroService],
})
export class FinanceiroModule {}





