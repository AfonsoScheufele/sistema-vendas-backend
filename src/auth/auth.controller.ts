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
    email: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; senha: string }) {
    if (!body.email || !body.senha) {
      throw new BadRequestException('Email e senha são obrigatórios');
    }

    const user = await this.authService.validateUser(body.email, body.senha);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tokens = await this.authService.login(user);
    
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: { 
      email: string; 
      senha: string; 
      name: string;
      role?: string;
    }
  ) {
    if (!body.email || !body.senha || !body.name) {
      throw new BadRequestException('Email, senha e nome são obrigatórios');
    }

    if (body.senha.length < 6) {
      throw new BadRequestException('A senha deve ter pelo menos 6 caracteres');
    }

    const user = await this.authService.register(
      body.email,
      body.senha,
      body.name,
      body.role || 'User'
    );

    const tokens = await this.authService.login(user);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        id: user.id,
        name: user.name,
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
    
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };
  }

  @Post('recuperar-senha')
  @HttpCode(HttpStatus.OK)
  async recuperarSenha(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email é obrigatório');
    }

    const result = await this.authService.solicitarRecuperacaoSenha(body.email);
    
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