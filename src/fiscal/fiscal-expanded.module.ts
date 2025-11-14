import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalExpandedController } from './fiscal-expanded.controller';
import { FiscalService } from './fiscal.service';
import { NotaFiscalEntity } from './nota-fiscal.entity';
import { SpedEntity } from './sped.entity';
import { ImpostoEntity } from './imposto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotaFiscalEntity, SpedEntity, ImpostoEntity])],
  controllers: [FiscalExpandedController],
  providers: [FiscalService],
  exports: [FiscalService],
})
export class FiscalExpandedModule {}








