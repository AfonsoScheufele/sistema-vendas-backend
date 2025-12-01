import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfisController } from './perfis.controller';
import { PerfisService } from './perfis.service';
import { Perfil } from './perfil.entity';
import { PerfisSeedService } from './perfis.seed.service';
import { PermissaoEntity } from './permissao.entity';
import { PerfilPermissaoEntity } from './perfil-permissao.entity';
import { PermissoesService } from './permissoes.service';
import { PermissoesController } from './permissoes.controller';
import { PermissoesSeedService } from './permissoes.seed.service';
import { ConfiguracoesModule } from '../configuracoes/configuracoes.module';
import { ModuloEntity } from '../configuracoes/modulo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Perfil, PermissaoEntity, PerfilPermissaoEntity, ModuloEntity]),
    forwardRef(() => ConfiguracoesModule),
  ],
  controllers: [PerfisController, PermissoesController],
  providers: [PerfisService, PermissoesService, PerfisSeedService, PermissoesSeedService],
  exports: [PerfisService, PermissoesService],
})
export class PerfisModule {}









