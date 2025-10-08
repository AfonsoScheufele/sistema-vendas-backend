import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Perfil } from './perfil.entity';

@Injectable()
export class PerfisService {
  constructor(
    @InjectRepository(Perfil)
    private perfilRepo: Repository<Perfil>,
  ) {}

  async create(createPerfilDto: any): Promise<Perfil> {
    const perfilExiste = await this.perfilRepo.findOne({
      where: { nome: createPerfilDto.nome }
    });

    if (perfilExiste) {
      throw new ConflictException('Perfil com este nome já existe');
    }

    const perfil = this.perfilRepo.create({
      ...createPerfilDto,
      permissoes: createPerfilDto.permissoes || [],
    });

    return this.perfilRepo.save(perfil) as unknown as Perfil;
  }

  async findAll(): Promise<Perfil[]> {
    return await this.perfilRepo.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Perfil> {
    const perfil = await this.perfilRepo.findOne({ where: { id } });
    
    if (!perfil) {
      throw new NotFoundException(`Perfil com ID ${id} não encontrado`);
    }
    
    return perfil;
  }

  async update(id: number, updatePerfilDto: any): Promise<Perfil> {
    const perfil = await this.findOne(id);

    if (updatePerfilDto.nome && updatePerfilDto.nome !== perfil.nome) {
      const perfilExiste = await this.perfilRepo.findOne({
        where: { nome: updatePerfilDto.nome }
      });

      if (perfilExiste) {
        throw new ConflictException('Perfil com este nome já existe');
      }
    }

    Object.assign(perfil, updatePerfilDto);
    return await this.perfilRepo.save(perfil);
  }

  async remove(id: number): Promise<{ message: string }> {
    const perfil = await this.findOne(id);
    perfil.ativo = false;
    await this.perfilRepo.save(perfil);
    return { message: 'Perfil desativado com sucesso' };
  }

  async obterPermissoes(): Promise<string[]> {
    return [
      'produtos:read',
      'produtos:write',
      'produtos:delete',
      'clientes:read',
      'clientes:write',
      'clientes:delete',
      'vendas:read',
      'vendas:write',
      'vendas:delete',
      'orcamentos:read',
      'orcamentos:write',
      'orcamentos:delete',
      'pedidos:read',
      'pedidos:write',
      'pedidos:delete',
      'fornecedores:read',
      'fornecedores:write',
      'fornecedores:delete',
      'cotacoes:read',
      'cotacoes:write',
      'cotacoes:delete',
      'dashboard:read',
      'relatorios:read',
      'configuracoes:read',
      'configuracoes:write',
      'usuarios:read',
      'usuarios:write',
      'usuarios:delete',
    ];
  }
}
