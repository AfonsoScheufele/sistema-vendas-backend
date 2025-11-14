import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { VendedoresService } from './vendedores.service';

@Controller('vendedores')
@UseGuards(JwtAuthGuard)
export class VendedoresController {
  constructor(private readonly vendedoresService: VendedoresService) {}

  @Get()
  async listar(@Req() req: any) {
    return await this.vendedoresService.listar(req.empresaId);
  }
}


