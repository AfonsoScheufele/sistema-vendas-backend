import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicosService } from './servicos.service';
import { ServicosController } from './servicos.controller';
import { Servico } from './servico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Servico])],
  controllers: [ServicosController],
  providers: [ServicosService],
})
export class ServicosModule {}
