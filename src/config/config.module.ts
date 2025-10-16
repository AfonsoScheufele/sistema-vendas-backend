import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfisService } from './perfis.service';
import { PerfisController } from './perfis.controller';
import { Perfil } from './perfil.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Perfil])],
  controllers: [PerfisController],
  providers: [PerfisService],
  exports: [PerfisService],
})
export class ConfigModule {}





