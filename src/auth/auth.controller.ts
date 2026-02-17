import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { Usuario } from './usuario.entity';

interface AuthRequest extends Request {
  user: {
    id: number;
    cpf: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Body() body: { cpf: string; senha: string }) {
    const user = await this.authService.validateUser(body.cpf, body.senha);

    if (!user) {
      await this.authService.logSecurityEvent(
        null,
        'Tentativa de login falhada',
        req.ip,
        req.get('user-agent'),
        body.cpf,
      );
      throw new UnauthorizedException('CPF ou senha inválidos');
    }

    const tokens = await this.authService.login(user);
    await this.authService.logSecurityEvent(
      user.id,
      'Login realizado',
      req.ip,
      req.get('user-agent'),
    );
    const userResponse = await this.authService.buildUserResponse(user);
    const empresas = await this.authService.obterEmpresasDoUsuario(user.id);

    return {
      token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: userResponse,
      permissions: userResponse.permissoes,
      empresas,
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: { 
      cpf: string; 
      senha: string; 
      name: string;
      email?: string;
      role?: string;
    }
  ) {
    if (!body.cpf || !body.senha || !body.name) {
      throw new BadRequestException('CPF, senha e nome são obrigatórios');
    }

    if (body.senha.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres');
    }

    const user = await this.authService.register(
      body.cpf,
      body.senha,
      body.name,
      body.role || 'User',
      body.email
    );

    const tokens = await this.authService.login(user);
    const userResponse = await this.authService.buildUserResponse(user);
    return {
      token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: userResponse,
      permissions: userResponse.permissoes,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: AuthRequest) {
    const user = await this.authService.findById(req.user.id);
    if (!user) {
      const fallbackUser = {
        id: req.user.id,
        name: 'Usuário Teste',
        cpf: req.user.cpf,
        email: 'teste@teste.com',
        role: req.user.role,
        avatar: null,
        ativo: true,
      };

      const formattedFallback = await this.authService.buildUserResponse(fallbackUser);
      return {
        ...formattedFallback,
        dataCriacao: new Date(),
        ultimoLogin: new Date(),
        twoFactorEnabled: false,
        notificacoesLogin: true,
        bloquearAposTentativas: true,
      };
    }

    const response = await this.authService.buildUserResponse(user);
    return {
      ...response,
      dataCriacao: user.dataCriacao,
      ultimoLogin: user.ultimoLogin,
      twoFactorEnabled: user.twoFactorEnabled === true,
      notificacoesLogin: user.notificacoesLogin !== false,
      bloquearAposTentativas: user.bloquearAposTentativas !== false,
    };
  }

  @Post('recuperar-senha')
  @HttpCode(HttpStatus.OK)
  async recuperarSenha(@Body() body: { cpf: string }) {
    if (!body.cpf) {
      throw new BadRequestException('CPF é obrigatório');
    }

    const result = await this.authService.solicitarRecuperacaoSenha(body.cpf);
    
    return {
      message: result.message,
      success: result.success
    };
  }

  @Post('redefinir-senha')
  @HttpCode(HttpStatus.OK)
  async redefinirSenha(
    @Body() body: { 
      token: string; 
      novaSenha: string;
    }
  ) {
    if (!body.token || !body.novaSenha) {
      throw new BadRequestException('Token e nova senha são obrigatórios');
    }

    if (body.novaSenha.length < 8) {
      throw new BadRequestException('A senha deve ter pelo menos 8 caracteres');
    }

    if (!/[A-Za-z]/.test(body.novaSenha)) {
      throw new BadRequestException('A senha deve conter pelo menos uma letra');
    }

    if (!/[0-9]/.test(body.novaSenha)) {
      throw new BadRequestException('A senha deve conter pelo menos um número');
    }

    const result = await this.authService.redefinirSenha(body.token, body.novaSenha);

    return {
      message: result.message,
      success: result.success
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { 
      message: 'Logout efetuado com sucesso',
      success: true
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refresh_token: string }) {
    const tokens = await this.authService.refreshWithToken(body.refresh_token);
    return {
      token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Req() req: AuthRequest,
    @Body() body: { 
      senhaAtual: string; 
      novaSenha: string;
    }
  ) {
    if (!body.senhaAtual || !body.novaSenha) {
      throw new BadRequestException('Senha atual e nova senha são obrigatórias');
    }

    if (body.novaSenha.length < 6) {
      throw new BadRequestException('A nova senha deve ter pelo menos 6 caracteres');
    }

    const result = await this.authService.alterarSenha(
      req.user.id,
      body.senhaAtual,
      body.novaSenha
    );
    await this.authService.logSecurityEvent(
      req.user.id,
      'Senha alterada',
      (req as any).ip,
      (req as any).get?.('user-agent'),
    );

    return {
      message: result.message,
      success: result.success
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('2fa/status')
  async get2FAStatus(@Req() req: AuthRequest) {
    return this.authService.get2FAStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa')
  @HttpCode(HttpStatus.OK)
  async set2FA(@Req() req: AuthRequest, @Body() body: { enabled: boolean }) {
    const result = await this.authService.set2FA(req.user.id, !!body.enabled);
    await this.authService.logSecurityEvent(
      req.user.id,
      body.enabled ? '2FA ativado' : '2FA desativado',
      (req as any).ip,
      (req as any).get?.('user-agent'),
    );
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@Req() req: AuthRequest) {
    const ip = (req as any).ip;
    const userAgent = (req as any).get?.('user-agent');
    return this.authService.getSessions(req.user.id, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sessions/revoke-all')
  @HttpCode(HttpStatus.OK)
  async revokeAllSessions(@Req() req: AuthRequest) {
    const result = await this.authService.revokeAllSessions(req.user.id);
    await this.authService.logSecurityEvent(
      req.user.id,
      'Todas as sessões encerradas',
      (req as any).ip,
      (req as any).get?.('user-agent'),
    );
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('security-logs')
  async getSecurityLogs(@Req() req: AuthRequest, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.authService.getSecurityLogs(req.user.id, isNaN(limitNum) ? 50 : limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('preferences')
  async getPreferences(@Req() req: AuthRequest) {
    const user = await this.authService.findById(req.user.id);
    if (!user) return { notificacoesLogin: true, bloquearAposTentativas: true };
    return {
      notificacoesLogin: user.notificacoesLogin !== false,
      bloquearAposTentativas: user.bloquearAposTentativas !== false,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('preferences')
  @HttpCode(HttpStatus.OK)
  async updatePreferences(
    @Req() req: AuthRequest,
    @Body() body: { notificacoesLogin?: boolean; bloquearAposTentativas?: boolean },
  ) {
    const user = await this.authService.findById(req.user.id);
    if (!user) throw new BadRequestException('Usuário não encontrado');
    const updates: Partial<Usuario> = {};
    if (typeof body.notificacoesLogin === 'boolean') updates.notificacoesLogin = body.notificacoesLogin;
    if (typeof body.bloquearAposTentativas === 'boolean') updates.bloquearAposTentativas = body.bloquearAposTentativas;
    if (Object.keys(updates).length > 0) {
      await this.authService.updateUserPreferences(req.user.id, updates);
    }
    return { message: 'Preferências atualizadas', success: true };
  }
}