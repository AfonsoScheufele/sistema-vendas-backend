import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComissoesController } from './comissoes.controller';
import { ComissoesService } from './comissoes.service';
import { ComissaoEntity } from './comissao.entity';
import { ComissaoVendedorEntity } from './comissao-vendedor.entity';
import { Produto } from '../produtos/produto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ComissaoEntity, ComissaoVendedorEntity, Produto])],
  controllers: [ComissoesController],
  providers: [ComissoesService],
  exports: [ComissoesService],
})
export class ComissoesModule {}

