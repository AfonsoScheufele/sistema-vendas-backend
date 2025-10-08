import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from './clientes.service';
import { ClientesController, ApiClientesController } from './clientes.controller';
import { Cliente } from './cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente])],
  controllers: [ClientesController, ApiClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}