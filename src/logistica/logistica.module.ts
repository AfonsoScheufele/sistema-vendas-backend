import { Module } from '@nestjs/common';
import { LogisticaController } from './logistica.controller';

@Module({
  controllers: [LogisticaController],
})
export class LogisticaModule {}





