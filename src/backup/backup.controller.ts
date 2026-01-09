import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BackupService } from './backup.service';

@Controller('backup')
@UseGuards(JwtAuthGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('config')
  async obterConfiguracao(@Req() req: any) {
    const empresaId = req.empresaId;
    return this.backupService.obterConfiguracao(empresaId);
  }

  @Put('config')
  async atualizarConfiguracao(@Req() req: any, @Body() dados: any) {
    const empresaId = req.empresaId;
    return this.backupService.atualizarConfiguracao(empresaId, dados);
  }

  @Post('criar')
  async criarBackup(@Req() req: any, @Body() body: { tipo?: 'manual' | 'automatico' }) {
    const empresaId = req.empresaId;
    return this.backupService.criarBackup(empresaId, body.tipo || 'manual');
  }

  @Get()
  async listarBackups(@Req() req: any) {
    const empresaId = req.empresaId;
    return this.backupService.listarBackups(empresaId);
  }

  @Get(':id/download')
  async downloadBackup(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const empresaId = req.empresaId;
    const buffer = await this.backupService.downloadBackup(id, empresaId);
    const backup = await this.backupService.obterBackup(id, empresaId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="backup_${backup.id}.json"`,
    );
    res.send(buffer);
  }

  @Post(':id/restaurar')
  async restaurarBackup(@Param('id') id: string, @Req() req: any) {
    const empresaId = req.empresaId;
    await this.backupService.restaurarBackup(id, empresaId);
    return { message: 'Backup restaurado com sucesso' };
  }

  @Get(':id')
  async obterBackup(@Param('id') id: string, @Req() req: any) {
    const empresaId = req.empresaId;
    return this.backupService.obterBackup(id, empresaId);
  }

  @Delete(':id')
  async excluirBackup(@Param('id') id: string, @Req() req: any) {
    const empresaId = req.empresaId;
    await this.backupService.excluirBackup(id, empresaId);
    return { message: 'Backup excluído com sucesso' };
  }
}

