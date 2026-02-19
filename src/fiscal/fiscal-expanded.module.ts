import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalExpandedController } from './fiscal-expanded.controller';
import { FiscalService } from './fiscal.service';
import { NotaFiscalEntity } from './nota-fiscal.entity';
import { ItemNotaFiscalEntity } from './item-nota-fiscal.entity';
import { SpedEntity } from './sped.entity';
import { ImpostoEntity } from './imposto.entity';
import { EstoqueModule } from '../estoque/estoque.module';
import { NotaFiscalServicoEntity } from './nota-fiscal-servico.entity';
import { NfseController } from './nfse.controller';
import { NfseService } from './nfse.service';
import { Servico } from '../servicos/servico.entity';
import { Cliente } from '../clientes/cliente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotaFiscalEntity, 
      ItemNotaFiscalEntity, 
      SpedEntity, 
      ImpostoEntity, 
      NotaFiscalServicoEntity,
      Servico,
      Cliente
    ]),
    forwardRef(() => EstoqueModule),
  ],
  controllers: [FiscalExpandedController, NfseController],
  providers: [FiscalService, NfseService],
  exports: [FiscalService, NfseService],
})
export class FiscalExpandedModule {}








