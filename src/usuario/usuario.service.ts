import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Usuario } from '../auth/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>
  ) {}

  async findAll(): Promise<any[]> {
    try {
      const usuarios = await this.usuarioRepository.find({
        order: { dataCriacao: 'DESC' },
        take: 1000, 
      });
      return usuarios.map(u => {
        const { senha, resetPasswordToken, resetPasswordExpires, ...usuarioSemSenha } = u;
        return {
          ...usuarioSemSenha,
          nome: u.name, 
          name: u.name, 
          email: u.email || '',
          telefone: '', 
        };
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  async create(data: { name: string; cpf: string; email?: string; senha: string; role?: string }): Promise<Usuario> {
    const existingUser = await this.usuarioRepository.findOne({ where: { cpf: data.cpf } });
    
    if (existingUser) {
      throw new ConflictException('CPF já está em uso');
    }

    const hashedPassword = await bcrypt.hash(data.senha, 10);
    
    const user = this.usuarioRepository.create({
      cpf: data.cpf,
      email: data.email,
      senha: hashedPassword,
      name: data.name,
      role: data.role || 'User',
    });

    return await this.usuarioRepository.save(user);
  }

  async update(id: number, data: { name?: string; email?: string; role?: string; ativo?: boolean }): Promise<Usuario> {
    const user = await this.usuarioRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (data.name) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
    if (data.role) user.role = data.role;
    if (data.ativo !== undefined) user.ativo = data.ativo;

    return await this.usuarioRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.usuarioRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.usuarioRepository.remove(user);
  }
}

