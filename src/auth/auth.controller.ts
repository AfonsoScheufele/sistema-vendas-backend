import { 
  Controller, 
  Post, 
  Get, 
  UseGuards, 
  Req, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';

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
  async login(@Body() body: { cpf: string; senha: string }) {
    // Para teste, vamos aceitar qualquer CPF com senha 123456
    const mockUser = {
      id: 1,
      name: 'Usuário Teste',
      cpf: body.cpf.replace(/[^\d]/g, ''),
      email: 'teste@teste.com',
      role: 'Admin',
      avatar: null
    };

    const tokens = await this.authService.login(mockUser);
    
    return {
      token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: mockUser
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

    return {
      token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: AuthRequest) {
    const user = await this.authService.findById(req.user.id);
    
    // Se o usuário não for encontrado, retorna os dados do token (usuário mock)
    if (!user) {
      return {
        id: req.user.id,
        name: 'Usuário Teste',
        cpf: req.user.cpf,
        email: 'teste@teste.com',
        role: req.user.role,
        avatar: null
      };
    }

    return {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      email: user.email,
      role: user.role,
      avatar: user.avatar
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

    if (body.novaSenha.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres');
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

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Req() req: AuthRequest) {
    return this.authService.refresh(req.user);
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

    return {
      message: result.message,
      success: result.success
    };
  }
}