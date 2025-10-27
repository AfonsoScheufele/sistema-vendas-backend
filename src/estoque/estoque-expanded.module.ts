import { Module } from '@nestjs/common';
import { EstoqueExpandedController } from './estoque-expanded.controller';

@Module({
  controllers: [EstoqueExpandedController],
})
export class EstoqueExpandedModule {}




