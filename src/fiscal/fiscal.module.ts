import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalService } from './fiscal.service';
import { FiscalController } from './fiscal.controller';
import { NotaFiscal } from './nota-fiscal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotaFiscal])],
  controllers: [FiscalController],
  providers: [FiscalService],
  exports: [FiscalService],
})
export class FiscalModule {}








