import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orcamento } from './orcamento.entity';
import { OrcamentosService } from './orcamentos.service';
import { OrcamentosController } from './orcamentos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Orcamento])],
  providers: [OrcamentosService],
  controllers: [OrcamentosController],
  exports: [OrcamentosService],
})
export class OrcamentosModule {}


