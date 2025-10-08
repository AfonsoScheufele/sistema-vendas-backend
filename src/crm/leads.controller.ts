import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('crm/leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLeadDto: any) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('origem') origem?: string) {
    return this.leadsService.findAll({ status, origem });
  }

  @Get('stats')
  getStats() {
    return this.leadsService.obterStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: any) {
    return this.leadsService.update(+id, updateLeadDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  atualizarStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.leadsService.atualizarStatus(+id, body.status as any);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.leadsService.remove(+id);
  }
}
