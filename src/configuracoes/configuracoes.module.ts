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
import { ConfiguracaoPaginaEntity } from './configuracao-pagina.entity';
import { ConfiguracoesPaginasService } from './configuracoes-paginas.service';
import { ConfiguracoesPaginasController } from './configuracoes-paginas.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConfiguracaoEmpresaEntity,
      ModuloEntity,
      ModuloEmpresaEntity,
      ConfiguracaoPaginaEntity,
    ]),
  ],
  controllers: [ConfiguracoesController, ModulosController, ConfiguracoesPaginasController],
  providers: [ConfiguracoesService, ModulosService, ModulosSeedService, ConfiguracoesPaginasService],
  exports: [ConfiguracoesService, ModulosService, ConfiguracoesPaginasService],
})
export class ConfiguracoesModule {}

