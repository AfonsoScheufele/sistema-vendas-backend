import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsuarioEmpresaService } from '../../empresas/usuario-empresa.service';

@Injectable()
export class EmpresaPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usuarioEmpresaService: UsuarioEmpresaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const empresaId = request.empresaId;

    if (!user || !empresaId) {
      throw new ForbiddenException('Usuário ou empresa não identificados');
    }

    // Se for admin global, permitir tudo
    if (user.role === 'Admin') {
      return true;
    }

    // Obter permissões do usuário para esta empresa
    const permissoes = await this.usuarioEmpresaService.obterPermissoes(user.id, empresaId);

    // Verificar se o usuário tem pelo menos uma das permissões requeridas
    const temPermissao = requiredPermissions.some((perm) => permissoes.includes(perm));

    if (!temPermissao) {
      throw new ForbiddenException('Usuário não tem permissão para esta ação');
    }

    return true;
  }
}

