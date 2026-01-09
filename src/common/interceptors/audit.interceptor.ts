import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDIT_KEY, AuditOptions } from '../decorators/audit.decorator';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private auditoriaService: any = null;
  private tentativasObterServico = 0;
  private maxTentativas = 3;
  private dataSource: DataSource | null = null;

  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const metodoHttp = request.method;
    const endpoint = request.url;
    
    const auditOptions = this.reflector.get<AuditOptions>(AUDIT_KEY, context.getHandler());

    if (auditOptions?.ignorar) {
      return next.handle();
    }

    if (this.deveIgnorarRota(endpoint, metodoHttp)) {
      return next.handle();
    }

    const user = request.user;
    const empresaId = request.empresaId || 'default-empresa';
    const ipAddress = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];

    let dadosAntigos: any = null;
    if (['PUT', 'PATCH', 'DELETE'].includes(metodoHttp)) {
      dadosAntigos = request.body?.dadosAntigos || null;
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          if (!this.auditoriaService && this.tentativasObterServico < this.maxTentativas) {
            this.tentativasObterServico++;
            
            try {
              const { AuditoriaService } = await import('../../auditoria/auditoria.service');
              this.auditoriaService = this.moduleRef.get(AuditoriaService, { strict: false });
              if (!this.auditoriaService) {
                throw new Error('Serviço retornou null');
              }
            } catch (e) {
              try {
                this.auditoriaService = this.moduleRef.get('AuditoriaService', { strict: false });
                if (!this.auditoriaService) {
                  throw new Error('Serviço retornou null via string');
                }
              } catch (err) {
                console.error('[AuditInterceptor] Erro ao obter AuditoriaService:', err.message);
                if (this.tentativasObterServico >= this.maxTentativas) {
                  console.error('[AuditInterceptor] Máximo de tentativas atingido. Interceptor desabilitado.');
                }
                return;
              }
            }
          }

          if (!this.auditoriaService) {
            return;
          }

          const auditoriaService = this.auditoriaService;

          const tipoAcao =
            auditOptions?.tipoAcao ||
            (metodoHttp === 'POST' ? 'CREATE' : metodoHttp === 'PUT' || metodoHttp === 'PATCH' ? 'UPDATE' : metodoHttp === 'DELETE' ? 'DELETE' : 'VIEW');

          const entidade = auditOptions?.entidade || this.extrairEntidade(endpoint);

          const entidadeId = request.params?.id || request.body?.id || null;

          let dadosNovos: any = null;
          if (['POST', 'PUT', 'PATCH'].includes(metodoHttp)) {
            dadosNovos = request.body || null;
            if (dadosNovos) {
              dadosNovos = this.sanitizarDados(dadosNovos);
            }
          }

          const logData = {
            empresaId,
            usuarioId: user?.id,
            usuarioNome: user?.name || user?.nome || 'Sistema',
            tipoAcao,
            entidade,
            entidadeId: entidadeId ? String(entidadeId) : undefined,
            descricao: auditOptions?.descricao || this.gerarDescricao(tipoAcao, entidade, entidadeId),
            dadosAntigos: dadosAntigos ? this.sanitizarDados(dadosAntigos) : null,
            dadosNovos,
            ipAddress,
            userAgent,
            endpoint,
            metodoHttp,
          };

          try {
            await auditoriaService.criarLog(logData);
          } catch (serviceError) {
            console.error('[AuditInterceptor] Erro ao usar serviço, tentando inserção direta:', serviceError.message);
            try {
              await this.inserirLogDiretamente(logData);
            } catch (directError) {
              console.error('[AuditInterceptor] Erro ao inserir log diretamente:', directError.message);
              throw directError;
            }
          }
        } catch (error) {
          console.error('[AuditInterceptor] Erro ao registrar log de auditoria:', error);
        }
      }),
    );
  }

  private extrairEntidade(endpoint: string): string {
    const partes = endpoint.split('/').filter((p) => p && !p.match(/^\d+$/) && p !== 'api');
    
    if (partes.length > 0) {
      const ultimaParte = partes[partes.length - 1];
      const nomeEntidade = ultimaParte
        .split('-')
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
        .join(' ');
      return nomeEntidade || 'Desconhecido';
    }
    return 'Desconhecido';
  }

  private gerarDescricao(tipoAcao: string, entidade: string, entidadeId?: string | null): string {
    const acoes: Record<string, string> = {
      CREATE: 'Criou',
      UPDATE: 'Atualizou',
      DELETE: 'Excluiu',
      VIEW: 'Visualizou',
      LOGIN: 'Fez login',
      LOGOUT: 'Fez logout',
    };

    const acao = acoes[tipoAcao] || tipoAcao;
    const id = entidadeId ? ` #${entidadeId}` : '';
    return `${acao} ${entidade}${id}`;
  }

  private sanitizarDados(dados: any): any {
    if (!dados || typeof dados !== 'object') {
      return dados;
    }

    const dadosLimpos = { ...dados };
    const camposSensiveis = ['senha', 'password', 'token', 'refreshToken', 'accessToken'];

    camposSensiveis.forEach((campo) => {
      if (dadosLimpos[campo]) {
        dadosLimpos[campo] = '***';
      }
    });

    return dadosLimpos;
  }

  private deveIgnorarRota(endpoint: string, metodoHttp: string): boolean {
    const rotasIgnoradas = [
      '/health',
      '/api/health',
      '/notifications/nao-lidas',
      '/auditoria',
      '/auditoria/estatisticas',
    ];

    if (rotasIgnoradas.some(rota => endpoint.includes(rota))) {
      return true;
    }

    if (metodoHttp === 'GET') {
      if (endpoint.endsWith('/stats') || 
          endpoint.endsWith('/tipos') || 
          endpoint.endsWith('/categorias') || 
          endpoint.endsWith('/novos') ||
          endpoint.endsWith('/pipeline/snapshot')) {
        return true;
      }
      
      if (!endpoint.match(/\/\d+$/) && !endpoint.includes('/:id')) {
        const partes = endpoint.split('/').filter(p => p);
        if (partes.length <= 2 && !partes[partes.length - 1].match(/^\d+$/)) {
          return true;
        }
      }
    }

    if (endpoint.includes('/pdf') || 
        endpoint.includes('/download') || 
        endpoint.includes('/export') ||
        endpoint.includes('/config')) {
      return true;
    }

    return false;
  }

  private async inserirLogDiretamente(logData: any): Promise<void> {
    try {
      if (!this.dataSource) {
        try {
          const { DataSource } = require('typeorm');
          this.dataSource = this.moduleRef.get(DataSource, { strict: false });
        } catch (e) {
          console.error('[AuditInterceptor] DataSource não disponível para inserção direta');
          return;
        }
      }
      
      if (!this.dataSource) {
        console.error('[AuditInterceptor] DataSource ainda não disponível');
        return;
      }
      
      const { AuditoriaEntity } = await import('../../auditoria/auditoria.entity');
      const repo = this.dataSource.getRepository(AuditoriaEntity);
      const log = repo.create(logData);
      await repo.save(log);
    } catch (error) {
      console.error('[AuditInterceptor] Erro ao inserir log diretamente:', error);
      throw error;
    }
  }
}

