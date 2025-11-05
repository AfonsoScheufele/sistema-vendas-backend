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

  async findAll(): Promise<Perfil[]> {
    return await this.perfilRepo.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async findAllWithInactive(): Promise<Perfil[]> {
    return await this.perfilRepo.find({
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Perfil> {
    const perfil = await this.perfilRepo.findOne({ where: { id } });
    if (!perfil) {
      throw new NotFoundException('Perfil não encontrado');
    }
    return perfil;
  }

  async create(data: { nome: string; descricao?: string; permissoes?: string[]; cor?: string }): Promise<Perfil> {
    const existing = await this.perfilRepo.findOne({ where: { nome: data.nome } });
    if (existing) {
      throw new ConflictException('Já existe um perfil com este nome');
    }

    const perfil = this.perfilRepo.create({
      nome: data.nome,
      descricao: data.descricao || '',
      permissoes: data.permissoes || [],
      cor: data.cor || 'blue',
      ativo: true,
    });

    return await this.perfilRepo.save(perfil);
  }

  async update(id: number, data: { nome?: string; descricao?: string; permissoes?: string[]; cor?: string; ativo?: boolean }): Promise<Perfil> {
    const perfil = await this.findOne(id);

    if (data.nome && data.nome !== perfil.nome) {
      const existing = await this.perfilRepo.findOne({ where: { nome: data.nome } });
      if (existing) {
        throw new ConflictException('Já existe um perfil com este nome');
      }
      perfil.nome = data.nome;
    }

    if (data.descricao !== undefined) perfil.descricao = data.descricao;
    if (data.permissoes !== undefined) perfil.permissoes = data.permissoes;
    if (data.cor !== undefined) perfil.cor = data.cor;
    if (data.ativo !== undefined) perfil.ativo = data.ativo;

    return await this.perfilRepo.save(perfil);
  }

  async remove(id: number): Promise<void> {
    const perfil = await this.findOne(id);
    await this.perfilRepo.remove(perfil);
  }

  async countUsuariosVinculados(id: number): Promise<number> {
    
    const perfil = await this.findOne(id);
    const result = await this.perfilRepo.query(
      'SELECT COUNT(*) as count FROM usuarios WHERE role = $1',
      [perfil.nome]
    );
    return parseInt(result[0]?.count || '0', 10);
  }
}

