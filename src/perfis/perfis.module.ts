import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfisController } from './perfis.controller';
import { PerfisService } from './perfis.service';
import { Perfil } from './perfil.entity';
import { PerfisSeedService } from './perfis.seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Perfil])],
  controllers: [PerfisController],
  providers: [PerfisService, PerfisSeedService],
  exports: [PerfisService],
})
export class PerfisModule {}









