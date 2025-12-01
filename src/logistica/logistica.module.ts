import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticaController } from './logistica.controller';
import { LogisticaService } from './logistica.service';
import { ExpedicaoEntity } from './expedicao.entity';
import { TransportadoraEntity } from './transportadora.entity';
import { RoteiroEntity } from './roteiro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpedicaoEntity, TransportadoraEntity, RoteiroEntity])],
  controllers: [LogisticaController],
  providers: [LogisticaService],
  exports: [LogisticaService],
})
export class LogisticaModule {}





















