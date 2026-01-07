import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetasController } from './metas.controller';
import { MetasService } from './metas.service';
import { MetaEntity } from './meta.entity';
import { MetaProgressoEntity } from './meta-progresso.entity';
import { GrupoVendedores } from './grupo-vendedores.entity';
import { GrupoVendedorUsuario } from './grupo-vendedor-usuario.entity';
import { GruposVendedoresController } from './grupos-vendedores.controller';
import { GruposVendedoresService } from './grupos-vendedores.service';
import { Usuario } from '../auth/usuario.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MetaEntity,
      MetaProgressoEntity,
      GrupoVendedores,
      GrupoVendedorUsuario,
      Usuario,
      Pedido,
    ]),
    NotificationsModule,
  ],
  controllers: [MetasController, GruposVendedoresController],
  providers: [MetasService, GruposVendedoresService],
  exports: [MetasService, GruposVendedoresService],
})
export class MetasModule {}


