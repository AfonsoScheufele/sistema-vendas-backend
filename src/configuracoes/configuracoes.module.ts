import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracoesController } from './configuracoes.controller';
import { ConfiguracoesService } from './configuracoes.service';
import { ConfiguracaoEmpresaEntity } from './configuracao-empresa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConfiguracaoEmpresaEntity])],
  controllers: [ConfiguracoesController],
  providers: [ConfiguracoesService],
  exports: [ConfiguracoesService],
})
export class ConfiguracoesModule {}

