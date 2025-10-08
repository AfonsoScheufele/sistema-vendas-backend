import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { OportunidadesService } from './oportunidades.service';
import { OportunidadesController } from './oportunidades.controller';
import { Lead } from './lead.entity';
import { Oportunidade } from './oportunidade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Oportunidade])],
  controllers: [LeadsController, OportunidadesController],
  providers: [LeadsService, OportunidadesService],
  exports: [LeadsService, OportunidadesService],
})
export class CrmModule {}
