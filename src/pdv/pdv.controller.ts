import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PdvService } from './pdv.service';
import { CreatePdvSaleDto } from './dto/create-pdv-sale.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('pdv')
@UseGuards(JwtAuthGuard)
export class PdvController {
  constructor(private readonly pdvService: PdvService) {}

  @Post('venda')
  async realizarVenda(@Body() dto: CreatePdvSaleDto, @Req() req: any) {
    return this.pdvService.realizarVenda(dto, req.empresaId, req.user.id);
  }
}
