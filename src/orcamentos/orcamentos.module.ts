import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orcamento } from './orcamento.entity';
import { OrcamentosService } from './orcamentos.service';
import { OrcamentosController } from './orcamentos.controller';
import { PdfService } from '../common/services/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Orcamento])],
  providers: [OrcamentosService, PdfService],
  controllers: [OrcamentosController],
  exports: [OrcamentosService],
})
export class OrcamentosModule {}








