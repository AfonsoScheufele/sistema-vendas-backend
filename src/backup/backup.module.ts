import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupEntity } from './backup.entity';
import { BackupConfigEntity } from './backup-config.entity';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmpresasModule } from '../empresas/empresas.module';
import { UsuarioEmpresaEntity } from '../empresas/usuario-empresa.entity';
import { EmpresaEntity } from '../empresas/empresa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BackupEntity, BackupConfigEntity, EmpresaEntity, UsuarioEmpresaEntity]),
    NotificationsModule,
    EmpresasModule,
  ],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupModule {}

