import { Module } from '@nestjs/common';
import { ComissoesController, MetasController } from './comissoes.controller';
import { ComissoesService } from './comissoes.service';

@Module({
  controllers: [ComissoesController, MetasController],
  providers: [ComissoesService],
  exports: [ComissoesService],
})
export class ComissoesModule {}

