import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContabilController } from './contabil.controller';
import { ContabilService } from './contabil.service';
import { PlanoContaEntity } from './plano-conta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanoContaEntity])],
  controllers: [ContabilController],
  providers: [ContabilService],
  exports: [ContabilService],
})
export class ContabilModule {}

