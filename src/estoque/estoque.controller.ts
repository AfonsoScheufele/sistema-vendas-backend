import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EstoqueService } from './estoque.service';
import { CreateDepositoDto } from './dto/create-deposito.dto';
import { UpdateDepositoDto } from './dto/update-deposito.dto';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';

@Controller('estoque')
@UseGuards(JwtAuthGuard)
export class EstoqueController {
  constructor(private readonly estoqueService: EstoqueService) {}

  @Get('depositos')
  listarDepositos(@Req() req: any) {
    return this.estoqueService.listarDepositos(req.empresaId);
  }

  @Get('depositos/:id')
  obterDeposito(@Param('id') id: string, @Req() req: any) {
    return this.estoqueService.obterDepositoPorId(id, req.empresaId);
  }

  @Post('depositos')
  criarDeposito(@Body() dto: CreateDepositoDto, @Req() req: any) {
    return this.estoqueService.criarDeposito(dto, req.empresaId);
  }

  @Patch('depositos/:id')
  atualizarDeposito(@Param('id') id: string, @Body() dto: UpdateDepositoDto, @Req() req: any) {
    return this.estoqueService.atualizarDeposito(id, req.empresaId, dto);
  }

  @Delete('depositos/:id')
  removerDeposito(@Param('id') id: string, @Req() req: any) {
    return this.estoqueService.removerDeposito(id, req.empresaId);
  }

  @Get('movimentacoes')
  listarMovimentacoes(
    @Req() req: any,
    @Query('produtoId') produtoId?: string,
    @Query('tipo') tipo?: string,
  ) {
    return this.estoqueService.listarMovimentacoes(req.empresaId, {
      produtoId: produtoId ? Number(produtoId) : undefined,
      tipo,
    });
  }

  @Post('movimentacoes')
  registrarMovimentacao(@Body() dto: CreateMovimentacaoDto, @Req() req: any) {
    return this.estoqueService.registrarMovimentacao(dto, req.empresaId, dto.notaFiscalId);
  }

  @Get('stats')
  obterEstatisticas(@Req() req: any) {
    return this.estoqueService.obterEstatisticas(req.empresaId);
  }
}


