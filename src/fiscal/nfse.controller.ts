import { Controller, Get, Post, Body, Param, Patch, Res, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { NfseService } from './nfse.service';
import { CreateNfseDto } from './dto/create-nfse.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('fiscal/nfse')
@UseGuards(JwtAuthGuard)
export class NfseController {
  constructor(private readonly nfseService: NfseService) {}

  @Post()
  emitir(@Body() createNfseDto: CreateNfseDto, @Req() req: any) {
    return this.nfseService.emitir(createNfseDto, req.empresaId);
  }

  @Get()
  listar(@Req() req: any) {
    return this.nfseService.listar(req.empresaId);
  }

  @Get(':id')
  obter(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.nfseService.obterPorId(id, req.empresaId);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.nfseService.cancelar(id, req.empresaId);
  }

  @Get(':id/pdf')
  async baixarPdf(@Param('id', ParseIntPipe) id: number, @Req() req: any, @Res() res: Response) {
    const buffer = await this.nfseService.gerarPdf(id, req.empresaId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=nfse-${id}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
