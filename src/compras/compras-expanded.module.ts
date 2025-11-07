import { Module } from '@nestjs/common';
import { ComprasExpandedController } from './compras-expanded.controller';

@Module({
  controllers: [ComprasExpandedController],
})
export class ComprasExpandedModule {}


