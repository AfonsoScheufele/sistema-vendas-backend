import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { AuditoriaEntity } from './auditoria.entity';

export interface CriarLogAuditoriaDto {
  empresaId?: string;
  usuarioId?: number;
  usuarioNome?: string;
  tipoAcao: string;
  entidade: string;
  entidadeId?: string;
  descricao?: string;
  dadosAntigos?: any;
  dadosNovos?: any;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  metodoHttp?: string;
}

export interface FiltrosAuditoria {
  empresaId?: string;
  usuarioId?: number;
  tipoAcao?: string;
  entidade?: string;
  dataInicio?: Date;
  dataFim?: Date;
  busca?: string;
  pagina?: number;
  limite?: number;
}

@Injectable()
export class AuditoriaService implements OnModuleInit, OnModuleDestroy {
  private cleanupTimer: any | null = null;

  constructor(
    @InjectRepository(AuditoriaEntity)
    private readonly auditoriaRepo: Repository<AuditoriaEntity>,
  ) {}

  onModuleInit() {
    const retentionDays = parseInt(process.env.AUDIT_RETENTION_DAYS || '180', 10);
    const scheduleMs = 24 * 60 * 60 * 1000;
    const runCleanup = async () => {
      try {
        await this.limparLogsAntigos(retentionDays);
        console.log(`[Auditoria] Limpeza automática executada. Retenção: ${retentionDays} dias.`);
      } catch (err) {
        console.error('[Auditoria] Falha na limpeza automática:', err);
      }
    };
    runCleanup();
    this.cleanupTimer = setInterval(runCleanup, scheduleMs);
  }

  onModuleDestroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  async criarLog(dto: CriarLogAuditoriaDto): Promise<AuditoriaEntity> {
    const log = this.auditoriaRepo.create(dto);
    return await this.auditoriaRepo.save(log);
  }

  async listarLogs(filtros: FiltrosAuditoria = {}) {
    const {
      empresaId,
      usuarioId,
      tipoAcao,
      entidade,
      dataInicio,
      dataFim,
      busca,
      pagina = 1,
      limite = 50,
    } = filtros;

    const query = this.auditoriaRepo.createQueryBuilder('auditoria');

    if (empresaId) {
      query.andWhere('auditoria.empresaId = :empresaId', { empresaId });
    }

    if (usuarioId) {
      query.andWhere('auditoria.usuarioId = :usuarioId', { usuarioId });
    }

    if (tipoAcao) {
      query.andWhere('auditoria.tipoAcao = :tipoAcao', { tipoAcao });
    }

    if (entidade) {
      query.andWhere('auditoria.entidade = :entidade', { entidade });
    }

    if (dataInicio && dataFim) {
      query.andWhere('auditoria.dataAcao BETWEEN :dataInicio AND :dataFim', {
        dataInicio,
        dataFim,
      });
    } else if (dataInicio) {
      query.andWhere('auditoria.dataAcao >= :dataInicio', { dataInicio });
    } else if (dataFim) {
      query.andWhere('auditoria.dataAcao <= :dataFim', { dataFim });
    }

    if (busca) {
      query.andWhere(
        '(auditoria.descricao ILIKE :busca OR auditoria.usuarioNome ILIKE :busca OR auditoria.entidade ILIKE :busca)',
        { busca: `%${busca}%` },
      );
    }

    const total = await query.getCount();

    query
      .orderBy('auditoria.dataAcao', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite);

    const logs = await query.getMany();

    return {
      logs,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async obterLogPorId(id: number): Promise<AuditoriaEntity | null> {
    return await this.auditoriaRepo.findOne({ where: { id } });
  }

  async obterEstatisticas(empresaId?: string, dataInicio?: Date, dataFim?: Date) {
    const query = this.auditoriaRepo.createQueryBuilder('auditoria');

    if (empresaId) {
      query.andWhere('auditoria.empresaId = :empresaId', { empresaId });
    }

    if (dataInicio && dataFim) {
      query.andWhere('auditoria.dataAcao BETWEEN :dataInicio AND :dataFim', {
        dataInicio,
        dataFim,
      });
    }

    const total = await query.getCount();

    const porTipoAcao = await query
      .select('auditoria.tipoAcao', 'tipoAcao')
      .addSelect('COUNT(*)', 'total')
      .groupBy('auditoria.tipoAcao')
      .getRawMany();

    const porEntidade = await query
      .select('auditoria.entidade', 'entidade')
      .addSelect('COUNT(*)', 'total')
      .groupBy('auditoria.entidade')
      .orderBy('total', 'DESC')
      .limit(10)
      .getRawMany();

    const porUsuario = await query
      .select('auditoria.usuarioNome', 'usuarioNome')
      .addSelect('COUNT(*)', 'total')
      .groupBy('auditoria.usuarioNome')
      .orderBy('total', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      total,
      porTipoAcao,
      porEntidade,
      porUsuario,
    };
  }

  async limparLogsAntigos(dias: number = 90): Promise<number> {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);

    const resultado = await this.auditoriaRepo
      .createQueryBuilder()
      .delete()
      .where('dataAcao < :dataLimite', { dataLimite })
      .execute();

    return resultado.affected || 0;
  }
}

