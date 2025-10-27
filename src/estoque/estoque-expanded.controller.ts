import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ProdutosModule } from '../produtos/produtos.module';
import { ProdutosService } from '../produtos/produtos.service';
import { Inject, forwardRef } from '@nestjs/common';

@Controller()
@UseGuards(JwtAuthGuard)
export class EstoqueExpandedController {
  constructor(
    @Inject(forwardRef(() => ProdutosService))
    private readonly produtosService: ProdutosService,
  ) {}

  @Get('estoque/produtos')
  async listarProdutosEstoque() {
    return await this.produtosService.findAll();
  }

  @Get('estoque/transferencias')
  async listarTransferencias() {
    return [];
  }

  @Get('estoque/transferencias/stats')
  async obterStatsTransferencias() {
    return { total: 0, pendentes: 0, concluidas: 0 };
  }
}




