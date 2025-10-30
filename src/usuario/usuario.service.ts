import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Usuario } from '../auth/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

export const AVAILABLE_ROLES = {
  Admin: {
    label: 'Administrador',
    description: 'Acesso total ao sistema',
    permissions: ['*']
  },
  Gerente: {
    label: 'Gerente',
    description: 'Acesso a relatórios e gestão de equipe',
    permissions: ['vendas', 'clientes', 'produtos', 'relatorios', 'estoque']
  },
  Vendedor: {
    label: 'Vendedor',
    description: 'Acesso a vendas e clientes',
    permissions: ['vendas', 'clientes', 'orcamentos']
  },
  Fornecedor: {
    label: 'Fornecedor',
    description: 'Acesso apenas a suas cotações e produtos',
    permissions: ['cotacoes', 'produtos:view']
  },
  Financeiro: {
    label: 'Financeiro',
    description: 'Acesso ao módulo financeiro',
    permissions: ['financeiro', 'relatorios:financeiro']
  },
  Estoque: {
    label: 'Estoque',
    description: 'Acesso ao controle de estoque',
    permissions: ['estoque', 'produtos']
  },
  User: {
    label: 'Usuário',
    description: 'Acesso básico',
    permissions: []
  }
};

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>
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

    if (!AVAILABLE_ROLES[createUsuarioDto.role as keyof typeof AVAILABLE_ROLES]) {
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

    if (updateUsuarioDto.role && !AVAILABLE_ROLES[updateUsuarioDto.role as keyof typeof AVAILABLE_ROLES]) {
      throw new BadRequestException('Role inválida');
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

  getAvailableRoles() {
    return Object.entries(AVAILABLE_ROLES).map(([key, value]) => ({
      value: key,
      label: value.label,
      description: value.description,
      permissions: value.permissions
    }));
  }
}

