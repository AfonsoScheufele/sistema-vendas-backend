import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';
import { InvestimentoCarteira } from './investimento-carteira.entity';
import { InvestimentoAtivo } from './investimento-ativo.entity';
import { InvestimentoHistorico } from './investimento-historico.entity';
import { InvestimentoAlerta } from './investimento-alerta.entity';
import { OrcamentoCentroCustoEntity } from './orcamento-centro.entity';
import { OrcamentoMetaMensal } from './orcamento-meta.entity';
import { OrcamentoAlertaEntity } from './orcamento-alerta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvestimentoCarteira,
      InvestimentoAtivo,
      InvestimentoHistorico,
      InvestimentoAlerta,
      OrcamentoCentroCustoEntity,
      OrcamentoMetaMensal,
      OrcamentoAlertaEntity,
    ]),
  ],
  controllers: [FinanceiroController],
  providers: [FinanceiroService],
  exports: [FinanceiroService],
})
export class FinanceiroModule {}




















