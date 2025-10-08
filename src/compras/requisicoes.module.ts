import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequisicoesService } from './requisicoes.service';
import { RequisicoesController } from './requisicoes.controller';
import { Requisicao } from './requisicao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Requisicao])],
  controllers: [RequisicoesController],
  providers: [RequisicoesService],
  exports: [RequisicoesService],
})
export class RequisicoesModule {}
