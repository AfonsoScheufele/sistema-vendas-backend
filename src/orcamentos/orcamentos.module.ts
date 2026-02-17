import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orcamento } from './orcamento.entity';
import { OrcamentosService } from './orcamentos.service';
import { OrcamentosController } from './orcamentos.controller';
import { PdfService } from '../common/services/pdf.service';
import { PedidosModule } from '../pedidos/pedidos.module';
import { Produto } from '../produtos/produto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orcamento, Produto]),
    PedidosModule,
  ],
  providers: [OrcamentosService, PdfService],
  controllers: [OrcamentosController],
  exports: [OrcamentosService],
})
export class OrcamentosModule {}








