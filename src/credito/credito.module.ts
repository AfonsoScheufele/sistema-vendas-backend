import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracaoCreditoEntity } from './configuracao-credito.entity';
import { ContaReceberEntity } from '../financeiro/conta-receber.entity';
import { Cliente } from '../clientes/cliente.entity';
import { CreditoService } from './credito.service';
import { CreditoController } from './credito.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConfiguracaoCreditoEntity,
      ContaReceberEntity,
      Cliente,
    ]),
  ],
  controllers: [CreditoController],
  providers: [CreditoService],
  exports: [CreditoService],
})
export class CreditoModule {}
