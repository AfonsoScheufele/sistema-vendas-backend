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

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const auditOptions = this.reflector.get<AuditOptions>(AUDIT_KEY, context.getHandler());

    // Se não há opções de auditoria ou está marcado para ignorar, apenas continua
    // Por padrão, não registramos todas as requisições, apenas as que têm o decorator @Audit()
    if (!auditOptions || auditOptions.ignorar) {
      return next.handle();
    }

    // Obter dados do usuário e empresa
    const user = request.user;
    const empresaId = request.empresaId || 'default-empresa';
    const ipAddress = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];
    const endpoint = request.url;
    const metodoHttp = request.method;

    // Dados antes da execução (para UPDATE/DELETE)
    let dadosAntigos: any = null;
    if (['PUT', 'PATCH', 'DELETE'].includes(metodoHttp)) {
      // Tentar obter dados antigos se disponível
      dadosAntigos = request.body?.dadosAntigos || null;
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Lazy load do serviço de auditoria
          let auditoriaService: any = null;
          try {
            auditoriaService = this.moduleRef.get('AuditoriaService', { strict: false });
          } catch (e) {
            // Se não conseguir obter, tenta importar dinamicamente
            const { AuditoriaService } = await import('../../auditoria/auditoria.service');
            auditoriaService = this.moduleRef.get(AuditoriaService, { strict: false });
          }

          if (auditoriaService) {
            // Determinar tipo de ação
            const tipoAcao =
              auditOptions.tipoAcao ||
              (metodoHttp === 'POST' ? 'CREATE' : metodoHttp === 'PUT' || metodoHttp === 'PATCH' ? 'UPDATE' : metodoHttp === 'DELETE' ? 'DELETE' : 'VIEW');

            // Determinar entidade
            const entidade = auditOptions.entidade || this.extrairEntidade(endpoint);

            // Determinar ID da entidade
            const entidadeId = request.params?.id || request.body?.id || null;

            // Dados novos (para CREATE/UPDATE)
            let dadosNovos: any = null;
            if (['POST', 'PUT', 'PATCH'].includes(metodoHttp)) {
              dadosNovos = request.body || null;
              // Remover senhas e dados sensíveis
              if (dadosNovos) {
                dadosNovos = this.sanitizarDados(dadosNovos);
              }
            }

            // Criar log de auditoria
            await auditoriaService.criarLog({
              empresaId,
              usuarioId: user?.id,
              usuarioNome: user?.name || user?.nome || 'Sistema',
              tipoAcao,
              entidade,
              entidadeId: entidadeId ? String(entidadeId) : undefined,
              descricao: auditOptions.descricao || this.gerarDescricao(tipoAcao, entidade, entidadeId),
              dadosAntigos: dadosAntigos ? this.sanitizarDados(dadosAntigos) : null,
              dadosNovos,
              ipAddress,
              userAgent,
              endpoint,
              metodoHttp,
            });
          }
        } catch (error) {
          // Não falhar a requisição se houver erro na auditoria
          console.error('Erro ao registrar log de auditoria:', error);
        }
      }),
    );
  }

  private extrairEntidade(endpoint: string): string {
    const partes = endpoint.split('/').filter((p) => p && !p.match(/^\d+$/));
    if (partes.length > 0) {
      const ultimaParte = partes[partes.length - 1];
      return ultimaParte.charAt(0).toUpperCase() + ultimaParte.slice(1);
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
}

