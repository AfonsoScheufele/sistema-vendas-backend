import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracoesController } from './configuracoes.controller';
import { ConfiguracoesService } from './configuracoes.service';
import { ConfiguracaoEmpresaEntity } from './configuracao-empresa.entity';
import { ModuloEntity } from './modulo.entity';
import { ModuloEmpresaEntity } from './modulo-empresa.entity';
import { ModulosService } from './modulos.service';
import { ModulosController } from './modulos.controller';
import { ModulosSeedService } from './modulos.seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConfiguracaoEmpresaEntity,
      ModuloEntity,
      ModuloEmpresaEntity,
    ]),
  ],
  controllers: [ConfiguracoesController, ModulosController],
  providers: [ConfiguracoesService, ModulosService, ModulosSeedService],
  exports: [ConfiguracoesService, ModulosService],
})
export class ConfiguracoesModule {}

