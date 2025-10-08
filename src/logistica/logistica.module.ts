import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticaService } from './logistica.service';
import { LogisticaController } from './logistica.controller';
import { Transportadora } from './transportadora.entity';
import { Expedicao } from './expedicao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transportadora, Expedicao])],
  controllers: [LogisticaController],
  providers: [LogisticaService],
  exports: [LogisticaService],
})
export class LogisticaModule {}


