import { Module } from '@nestjs/common';
import { VendedoresController } from './vendedores.controller';
import { VendedoresService } from './vendedores.service';

@Module({
  controllers: [VendedoresController],
  providers: [VendedoresService],
  exports: [VendedoresService],
})
export class VendedoresModule {}


