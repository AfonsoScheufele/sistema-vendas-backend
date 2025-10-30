import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Usuario } from '../auth/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private rolesService: RolesService
  ) {}

  async findAll(): Promise<Usuario[]> {
    const usuarios = await this.usuarioRepository.find({
      select: ['id', 'name', 'cpf', 'email', 'role', 'avatar', 'ativo', 'ultimoLogin', 'dataCriacao', 'dataAtualizacao']
    });
    return usuarios;
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      select: ['id', 'name', 'cpf', 'email', 'role', 'avatar', 'ativo', 'ultimoLogin', 'dataCriacao', 'dataAtualizacao']
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return usuario;
  }

  async create(createUsuarioDto: {
    name: string;
    cpf: string;
    email?: string;
    senha: string;
    role: string;
  }): Promise<Usuario> {
    const existingUser = await this.usuarioRepository.findOne({
      where: { cpf: createUsuarioDto.cpf }
    });

    if (existingUser) {
      throw new ConflictException('CPF já está em uso');
    }

    const roleExists = await this.rolesService.findBySlug(createUsuarioDto.role);
    if (!roleExists) {
      throw new BadRequestException('Role inválida');
    }

    if (!createUsuarioDto.senha || createUsuarioDto.senha.length < 6) {
      throw new BadRequestException('Senha deve ter pelo menos 6 caracteres');
    }

    const hashedPassword = await bcrypt.hash(createUsuarioDto.senha, 10);

    const usuario = this.usuarioRepository.create({
      name: createUsuarioDto.name,
      cpf: createUsuarioDto.cpf,
      email: createUsuarioDto.email,
      senha: hashedPassword,
      role: createUsuarioDto.role,
      ativo: true
    });

    const saved = await this.usuarioRepository.save(usuario);

    const { senha, ...result } = saved;
    return result as Usuario;
  }

  async update(id: number, updateUsuarioDto: {
    name?: string;
    email?: string;
    role?: string;
    ativo?: boolean;
    senha?: string;
  }): Promise<Usuario> {
    const usuario = await this.findOne(id);

    if (updateUsuarioDto.role) {
      const roleExists = await this.rolesService.findBySlug(updateUsuarioDto.role);
      if (!roleExists) {
        throw new BadRequestException('Role inválida');
      }
    }

    if (updateUsuarioDto.senha) {
      if (updateUsuarioDto.senha.length < 6) {
        throw new BadRequestException('Senha deve ter pelo menos 6 caracteres');
      }
      updateUsuarioDto.senha = await bcrypt.hash(updateUsuarioDto.senha, 10);
    }

    Object.assign(usuario, updateUsuarioDto);
    const updated = await this.usuarioRepository.save(usuario);

    const { senha, ...result } = updated;
    return result as Usuario;
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuarioRepository.remove(usuario);
  }

  async toggleStatus(id: number): Promise<Usuario> {
    const usuario = await this.findOne(id);
    usuario.ativo = !usuario.ativo;
    const updated = await this.usuarioRepository.save(usuario);

    const { senha, ...result } = updated;
    return result as Usuario;
  }
}

