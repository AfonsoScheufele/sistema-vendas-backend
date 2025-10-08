import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
  ) {}

  async validateUser(email: string, senha: string): Promise<any> {
    const user = await this.usuarioRepo.findOne({ where: { email } });
    
    if (user && await bcrypt.compare(senha, user.senha)) {
      // Atualizar último login
      await this.usuarioRepo.update(user.id, { ultimoLogin: new Date() });
      
      const { senha, ...result } = user;
      return result;
    }
    return null;
  }

  async register(email: string, senha: string, name: string, role: string = 'User'): Promise<Usuario> {
    const existingUser = await this.usuarioRepo.findOne({ where: { email } });
    
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    
    const user = this.usuarioRepo.create({
      email,
      senha: hashedPassword,
      name,
      role,
    });

    return await this.usuarioRepo.save(user);
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refresh(user: any) {
    const payload = { sub: user.sub, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
    };
  }

  async findById(id: number): Promise<Usuario | null> {
    return await this.usuarioRepo.findOne({ where: { id } });
  }

  async solicitarRecuperacaoSenha(email: string): Promise<{ message: string; success: boolean }> {
    const user = await this.usuarioRepo.findOne({ where: { email } });
    
    if (!user) {
      return {
        message: 'Se o email existir em nosso sistema, você receberá instruções para redefinir sua senha.',
        success: true
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    await this.usuarioRepo.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    // Aqui você implementaria o envio de email
    console.log(`Token de recuperação para ${email}: ${resetToken}`);

    return {
      message: 'Se o email existir em nosso sistema, você receberá instruções para redefinir sua senha.',
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

    const isCurrentPasswordValid = await bcrypt.compare(senhaAtual, user.senha);
    
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
