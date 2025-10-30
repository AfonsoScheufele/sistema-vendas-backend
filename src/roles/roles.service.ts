import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './role.entity';

// Lista base de permission keys agrupadas por módulo
export const AVAILABLE_PERMISSIONS: Record<string, string[]> = {
  'vendas': ['vendas.pedidos.view', 'vendas.pedidos.edit', 'vendas.orcamentos.view', 'vendas.orcamentos.edit', 'vendas.comissoes.view', 'vendas.comissoes.edit'],
  'estoque': ['estoque.view', 'estoque.edit', 'estoque.transferencias.view', 'estoque.transferencias.edit'],
  'compras': ['compras.cotacoes.view', 'compras.cotacoes.edit', 'compras.pedidos.view', 'compras.pedidos.edit'],
  'financeiro': ['financeiro.view', 'financeiro.receber.view', 'financeiro.pagar.view', 'financeiro.conciliacao.view'],
  'fiscal': ['fiscal.notas.view', 'fiscal.sped.view', 'fiscal.impostos.view'],
  'crm': ['crm.leads.view', 'crm.oportunidades.view', 'crm.campanhas.view'],
  'config': ['config.usuarios.view', 'config.usuarios.edit', 'config.tipos.view', 'config.tipos.edit'],
};

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly repo: Repository<RoleEntity>,
  ) {}

  async findAll(): Promise<RoleEntity[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<RoleEntity> {
    const role = await this.repo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role não encontrada');
    return role;
  }

  async create(data: Partial<RoleEntity>): Promise<RoleEntity> {
    const role = this.repo.create({
      slug: data.slug?.trim().toLowerCase()!,
      name: data.name!,
      description: data.description || '',
      active: data.active ?? true,
      permissions: Array.isArray((data as any).permissions)
        ? JSON.stringify((data as any).permissions)
        : typeof data.permissions === 'string'
          ? data.permissions
          : '[]',
    });
    return this.repo.save(role);
  }

  async update(id: number, data: Partial<RoleEntity>): Promise<RoleEntity> {
    const role = await this.findOne(id);
    role.slug = (data.slug ?? role.slug).trim().toLowerCase();
    role.name = data.name ?? role.name;
    role.description = data.description ?? role.description;
    role.active = data.active ?? role.active;
    if (data.permissions !== undefined) {
      role.permissions = Array.isArray((data as any).permissions)
        ? JSON.stringify((data as any).permissions)
        : typeof data.permissions === 'string'
          ? data.permissions
          : role.permissions;
    }
    return this.repo.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.repo.remove(role);
  }

  async listAvailablePermissions(): Promise<Record<string, string[]>> {
    return AVAILABLE_PERMISSIONS;
  }
}


