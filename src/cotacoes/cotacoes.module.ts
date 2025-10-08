import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CotacoesService } from './cotacoes.service';
import { CotacoesController } from './cotacoes.controller';
import { Cotacao } from './cotacao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cotacao])],
  controllers: [CotacoesController],
  providers: [CotacoesService],
  exports: [CotacoesService],
})
export class CotacoesModule {}
