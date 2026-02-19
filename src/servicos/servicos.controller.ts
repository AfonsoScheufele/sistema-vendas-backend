import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { CreateServicoDto } from './dto/create-servico.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('servicos')
@UseGuards(JwtAuthGuard)
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Post()
  create(@Body() createServicoDto: CreateServicoDto, @Req() req: any) {
    return this.servicosService.create(createServicoDto, req.empresaId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.servicosService.findAll(req.empresaId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.servicosService.findOne(id, req.empresaId);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateServicoDto: CreateServicoDto, @Req() req: any) {
    return this.servicosService.update(id, updateServicoDto, req.empresaId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.servicosService.remove(id, req.empresaId);
  }
}
