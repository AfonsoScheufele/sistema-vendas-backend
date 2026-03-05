import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UsuarioEmpresaService } from '../../empresas/usuario-empresa.service';

@Injectable()
export class EmpresaContextInterceptor implements NestInterceptor {
  private usuarioEmpresaService: UsuarioEmpresaService | null = null;

  constructor(private readonly moduleRef: ModuleRef) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const path = request.url || request.path || '';
    const isListarMinhasEmpresas = path.includes('minhas-empresas');

    const empresaHeader = (
      request.headers?.['empresa'] ??
      request.headers?.['x-empresa-id'] ??
      request.headers?.['empresa-id']
    ) as string | undefined;

    if (!this.usuarioEmpresaService) {
      try {
        this.usuarioEmpresaService = this.moduleRef.get(UsuarioEmpresaService, { strict: false });
      } catch (error) {
      }
    }

    const empresaId: string | undefined = empresaHeader && typeof empresaHeader === 'string' ? empresaHeader.trim() || undefined : undefined;

    if (!empresaId) {
      request.empresaId = undefined;
      return next.handle();
    }

    request.empresaId = empresaId;

    if (!isListarMinhasEmpresas && request.user?.id && this.usuarioEmpresaService) {
      try {
        const temAcesso = await this.usuarioEmpresaService.verificarAcesso(request.user.id, empresaId);
        if (!temAcesso) {
          throw new UnauthorizedException('Usuário não tem acesso a esta empresa');
        }
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        console.warn('Erro ao validar acesso do usuário à empresa:', error);
      }
    }

    return next.handle();
  }
}

