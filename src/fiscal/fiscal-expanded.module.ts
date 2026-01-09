import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalExpandedController } from './fiscal-expanded.controller';
import { FiscalService } from './fiscal.service';
import { NotaFiscalEntity } from './nota-fiscal.entity';
import { ItemNotaFiscalEntity } from './item-nota-fiscal.entity';
import { SpedEntity } from './sped.entity';
import { ImpostoEntity } from './imposto.entity';
import { EstoqueModule } from '../estoque/estoque.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotaFiscalEntity, ItemNotaFiscalEntity, SpedEntity, ImpostoEntity]),
    forwardRef(() => EstoqueModule),
  ],
  controllers: [FiscalExpandedController],
  providers: [FiscalService],
  exports: [FiscalService],
})
export class FiscalExpandedModule {}








