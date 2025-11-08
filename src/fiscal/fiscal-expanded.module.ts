import { Module } from '@nestjs/common';
import { FiscalExpandedController } from './fiscal-expanded.controller';

@Module({
  controllers: [FiscalExpandedController],
})
export class FiscalExpandedModule {}



