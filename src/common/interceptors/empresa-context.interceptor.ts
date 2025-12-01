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

    let empresaId: string | undefined = empresaHeader && typeof empresaHeader === 'string' ? empresaHeader : undefined;
    let empresaAutoSelecionada = false;

    if (!empresaId && request.user?.id && this.usuarioEmpresaService) {
      try {
        const empresas = await this.usuarioEmpresaService.listarEmpresasDoUsuario(request.user.id);
        if (empresas && empresas.length > 0) {
          empresaId = empresas[0].id;
          empresaAutoSelecionada = true;
        }
      } catch (error) {
        console.warn('Erro ao obter empresas do usuário:', error);
      }
    }

    if (!empresaId) {
      request.empresaId = undefined;
      return next.handle();
    }

    request.empresaId = empresaId;

    if (request.user?.id && this.usuarioEmpresaService && !empresaAutoSelecionada) {
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

