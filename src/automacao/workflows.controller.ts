import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkflowsService } from './workflows.service';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  async listarWorkflows() {
    return await this.workflowsService.findAll();
  }

  @Get('stats')
  async obterStats() {
    return await this.workflowsService.getStats();
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return await this.workflowsService.findOne(+id);
  }

  @Post()
  async criar(@Body() data: any) {
    return await this.workflowsService.create(data);
  }

  @Patch(':id')
  async atualizar(@Param('id') id: string, @Body() data: any) {
    return await this.workflowsService.update(+id, data);
  }

  @Delete(':id')
  async excluir(@Param('id') id: string) {
    return await this.workflowsService.delete(+id);
  }

  @Patch(':id/toggle')
  async toggleStatus(@Param('id') id: string) {
    return await this.workflowsService.toggleStatus(+id);
  }
}

