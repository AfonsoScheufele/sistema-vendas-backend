import { Injectable, ConflictException, NotFoundException, UnauthorizedException, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Perfil } from '../perfis/perfil.entity';
import { EmailService } from '../config/email.service';
import { UsuarioEmpresaService } from '../empresas/usuario-empresa.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    @InjectRepository(Perfil)
    private perfilRepo: Repository<Perfil>,
    private emailService: EmailService,
    @Inject(forwardRef(() => UsuarioEmpresaService))
    private usuarioEmpresaService?: UsuarioEmpresaService,
  ) {}

  private async getPermissoesByRole(role?: string): Promise<string[]> {
    if (!role) return [];
    const perfil = await this.perfilRepo.findOne({ where: { nome: role } });
    if (!perfil) {
      console.warn(`[AuthService] Perfil não encontrado para role: ${role}`);
      return [];
    }
    if (perfil.permissoes === null || perfil.permissoes === undefined) {
      return [];
    }
    const perms = (perfil.permissoes || [])
      .map((permissao) => (permissao || '').trim())
      .filter((permissao) => permissao.length > 0);
    if (perms.length === 0) {
      console.warn(`[AuthService] Perfil ${role} sem permissões configuradas.`);
    }
    return perms;
  }

  async buildUserResponse(user: any, empresaId?: string) {
    const permissoes = await this.getPermissoesByRole(user.role);
    return {
      id: user.id,
      name: user.name,
      nome: user.name,
      cpf: user.cpf,
      email: user.email || '',
      role: user.role,
      avatar: user.avatar,
      ativo: user.ativo,
      permissoes,
      empresaId: empresaId || null,
    };
  }

  async validateUser(cpf: string, senha: string): Promise<any> {
    try {
      const cpfLimpo = cpf.replace(/[^\d]/g, '');
      const users = await this.usuarioRepo.query(
        'SELECT id, name, cpf, email, role, avatar, ativo FROM usuarios WHERE cpf = $1',
        [cpfLimpo]
      );
      
      if (!users || users.length === 0) {
        return null;
      }

      const user = users[0];
      const senhaResult = await this.usuarioRepo.query(
        'SELECT senha FROM usuarios WHERE cpf = $1',
        [cpfLimpo]
      );
      
      if (!senhaResult || senhaResult.length === 0) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(senha, senhaResult[0].senha);
      
      if (!isPasswordValid) {
        return null;
      }
      await this.usuarioRepo.query(
        'UPDATE usuarios SET "ultimoLogin" = NOW() WHERE cpf = $1',
        [cpfLimpo]
      );
      
      return {
        ...user,
        permissoes: await this.getPermissoesByRole(user.role),
      };
    } catch (error) {
      console.error('Error in validateUser:', error);
      return null;
    }
  }

  async register(cpf: string, senha: string, name: string, role: string = 'User', email?: string): Promise<Usuario> {
    const existingUser = await this.usuarioRepo.findOne({ where: { cpf } });
    
    if (existingUser) {
      throw new ConflictException('CPF já está em uso');
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    
    const user = this.usuarioRepo.create({
      cpf,
      email,
      senha: hashedPassword,
      name,
      role,
    });

    return await this.usuarioRepo.save(user);
  }

  private async generateTokens(payload: any) {
    const access_token = this.jwtService.sign(payload, { expiresIn: '12h' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { access_token, refresh_token };
  }

  private async setRefreshToken(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.usuarioRepo.update(userId, {
      refreshTokenHash: hash,
      refreshTokenExpires: expires,
    });
  }

  private async revokeRefreshToken(userId: number) {
    await this.usuarioRepo.update(userId, {
      refreshTokenHash: null,
      refreshTokenExpires: null,
    });
  }

  async login(user: any) {
    const permissoes = await this.getPermissoesByRole(user.role);
    const payload = { sub: user.id, cpf: user.cpf, role: user.role, permissoes };
    const tokens = await this.generateTokens(payload);
    await this.setRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async refreshWithToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token é obrigatório');
    }
    let decoded: any;
    try {
      decoded = this.jwtService.verify(refreshToken);
    } catch (e) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    const user = await this.usuarioRepo.findOne({ where: { id: decoded.sub } });
    if (!user || !user.refreshTokenHash || !user.refreshTokenExpires) {
      throw new UnauthorizedException('Refresh token não registrado');
    }
    if (user.refreshTokenExpires < new Date()) {
      await this.revokeRefreshToken(user.id);
      throw new UnauthorizedException('Refresh token expirado');
    }
    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isMatch) {
      await this.revokeRefreshToken(user.id);
      throw new UnauthorizedException('Refresh token inválido');
    }
    const permissoes = await this.getPermissoesByRole(user.role);
    const payload = { sub: user.id, cpf: user.cpf, role: user.role, permissoes };
    const tokens = await this.generateTokens(payload);
    await this.setRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async findById(id: number): Promise<Usuario | null> {
    return await this.usuarioRepo.findOne({ where: { id } });
  }

  async obterEmpresasDoUsuario(usuarioId: number): Promise<any[]> {
    if (!this.usuarioEmpresaService) {
      return [];
    }
    try {
      const empresas = await this.usuarioEmpresaService.listarEmpresasDoUsuario(usuarioId);
      return empresas.map((emp) => ({
        id: emp.id,
        nome: emp.nome,
        cnpj: emp.cnpj,
        ativo: emp.ativo,
      }));
    } catch (error) {
      console.error('Erro ao obter empresas do usuário:', error);
      return [];
    }
  }

  async solicitarRecuperacaoSenha(cpf: string): Promise<{ message: string; success: boolean }> {
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    const users = await this.usuarioRepo.query(
      'SELECT id, email FROM usuarios WHERE cpf = $1',
      [cpfLimpo]
    );
    
    if (!users || users.length === 0) {
      return {
        message: 'Se o CPF existir em nosso sistema, você receberá instruções para redefinir sua senha.',
        success: true
      };
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); 

    await this.usuarioRepo.query(
      'UPDATE usuarios SET "resetPasswordToken" = $1, "resetPasswordExpires" = $2 WHERE cpf = $3',
      [resetToken, resetExpires, cpfLimpo]
    );
    if (user.email) {
      try {
        await this.emailService.sendResetPasswordEmail(user.email, resetToken);
      } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        
      }
    }

    return {
      message: 'Se o CPF existir em nosso sistema, você receberá instruções para redefinir sua senha.',
      success: true
    };
  }

  async redefinirSenha(token: string, novaSenha: string): Promise<{ message: string; success: boolean }> {
    const user = await this.usuarioRepo.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    await this.usuarioRepo.update(user.id, {
      senha: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return {
      message: 'Senha redefinida com sucesso',
      success: true
    };
  }

  async alterarSenha(userId: number, senhaAtual: string, novaSenha: string): Promise<{ message: string; success: boolean }> {
    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isCurrentPasswordValid = await bcrypt.compare(senhaAtual, (user.senha || ''));
    
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const hashedNewPassword = await bcrypt.hash(novaSenha, 10);

    await this.usuarioRepo.update(userId, {
      senha: hashedNewPassword,
    });

    return {
      message: 'Senha alterada com sucesso',
      success: true
    };
  }
}
