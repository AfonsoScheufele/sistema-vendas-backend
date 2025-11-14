import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetasController } from './metas.controller';
import { MetasService } from './metas.service';
import { MetaEntity } from './meta.entity';
import { MetaProgressoEntity } from './meta-progresso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MetaEntity, MetaProgressoEntity])],
  controllers: [MetasController],
  providers: [MetasService],
  exports: [MetasService],
})
export class MetasModule {}


