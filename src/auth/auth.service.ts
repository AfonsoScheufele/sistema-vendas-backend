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

  async validateUser(cpf: string, senha: string): Promise<any> {
    const user = await this.usuarioRepo.findOne({ where: { cpf } });
    
    if (user && await bcrypt.compare(senha, user.senha)) {
      await this.usuarioRepo.update(user.id, { ultimoLogin: new Date() });
      
      const { senha, ...result } = user;
      return result;
    }
    return null;
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
    const user = await this.usuarioRepo.findOne({ where: { cpf } });
    
    if (!user) {
      return {
        message: 'Se o CPF existir em nosso sistema, você receberá instruções para redefinir sua senha.',
        success: true
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); 

    await this.usuarioRepo.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires,
    });

    
    console.log(`Token de recuperação para CPF ${cpf}: ${resetToken}`);

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
