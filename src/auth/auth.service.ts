import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';
import { EmailService } from '../config/email.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    private emailService: EmailService,
  ) {}

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
      
      return user;
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

  async login(user: any) {
    const payload = { sub: user.id, cpf: user.cpf, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refresh(user: any) {
    const payload = { sub: user.sub, cpf: user.cpf, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
    };
  }

  async findById(id: number): Promise<Usuario | null> {
    return await this.usuarioRepo.findOne({ where: { id } });
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
