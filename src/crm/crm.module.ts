import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './lead.entity';
import { Oportunidade } from './oportunidade.entity';
import { Campanha } from './campanha.entity';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Oportunidade, Campanha])],
  providers: [CrmService],
  controllers: [CrmController],
  exports: [CrmService],
})
export class CrmModule {}



