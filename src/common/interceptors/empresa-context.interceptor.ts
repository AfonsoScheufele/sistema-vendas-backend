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
    const empresaHeader = (request.headers?.['x-empresa-id'] ?? request.headers?.['empresa-id']) as string | undefined;

    // Obter serviço dinamicamente para evitar dependência circular
    if (!this.usuarioEmpresaService) {
      try {
        this.usuarioEmpresaService = this.moduleRef.get(UsuarioEmpresaService, { strict: false });
      } catch (error) {
        // Serviço não disponível ainda, ignorar
      }
    }

    let empresaId: string | undefined = empresaHeader && typeof empresaHeader === 'string' ? empresaHeader : undefined;
    let empresaAutoSelecionada = false;

    // Se não houver header de empresa e houver usuário autenticado, pegar primeira empresa do usuário
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

    // Se ainda não houver empresaId, permitir continuar sem validação (para compatibilidade)
    if (!empresaId) {
      request.empresaId = undefined;
      return next.handle();
    }

    request.empresaId = empresaId;

    // Se houver usuário autenticado e a empresa foi fornecida explicitamente (não auto-selecionada), validar acesso
    if (request.user?.id && this.usuarioEmpresaService && !empresaAutoSelecionada) {
      try {
        const temAcesso = await this.usuarioEmpresaService.verificarAcesso(request.user.id, empresaId);
        if (!temAcesso) {
          throw new UnauthorizedException('Usuário não tem acesso a esta empresa');
        }
      } catch (error) {
        // Se não conseguir validar (serviço não disponível), permitir para compatibilidade
        if (error instanceof UnauthorizedException) {
          throw error;
        }
        console.warn('Erro ao validar acesso do usuário à empresa:', error);
      }
    }
    // Se a empresa foi auto-selecionada, já sabemos que o usuário tem acesso (ela veio da lista de empresas do usuário)

    return next.handle();
  }
}

