import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkflowsService } from './workflows.service';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  async listarWorkflows(@Req() req: any) {
    return await this.workflowsService.findAll(req.empresaId);
  }

  @Get('stats')
  async obterStats(@Req() req: any) {
    return await this.workflowsService.getStats(req.empresaId);
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string, @Req() req: any) {
    return await this.workflowsService.findOne(+id, req.empresaId);
  }

  @Post()
  async criar(@Body() data: any, @Req() req: any) {
    return await this.workflowsService.create(req.empresaId, data);
  }

  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return await this.workflowsService.update(+id, req.empresaId, data);
  }

  @Delete(':id')
  async excluir(@Param('id') id: string, @Req() req: any) {
    return await this.workflowsService.delete(+id, req.empresaId);
  }

  @Patch(':id/toggle')
  async toggleStatus(@Param('id') id: string, @Req() req: any) {
    return await this.workflowsService.toggleStatus(+id, req.empresaId);
  }
}









