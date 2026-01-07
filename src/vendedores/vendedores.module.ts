import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendedoresController } from './vendedores.controller';
import { VendedoresService } from './vendedores.service';
import { Usuario } from '../auth/usuario.entity';
import { UsuarioEmpresaEntity } from '../empresas/usuario-empresa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, UsuarioEmpresaEntity])],
  controllers: [VendedoresController],
  providers: [VendedoresService],
  exports: [VendedoresService],
})
export class VendedoresModule {}




















