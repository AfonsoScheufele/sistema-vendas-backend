import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpresaEntity } from './empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { ModulosService } from '../configuracoes/modulos.service';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(EmpresaEntity)
    private readonly empresaRepo: Repository<EmpresaEntity>,
    @Inject(forwardRef(() => ModulosService))
    private readonly modulosService: ModulosService,
  ) {}

  async listarEmpresas() {
    const empresas = await this.empresaRepo.find({
      order: { nome: 'ASC' },
    });
    return empresas.map((emp) => this.mapToResponse(emp));
  }

  async obterPorId(id: string) {
    const empresa = await this.empresaRepo.findOne({ where: { id } });
    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }
    return this.mapToResponse(empresa);
  }

  async criar(dto: CreateEmpresaDto) {
    if (dto.cnpj) {
      const cnpjLimpo = dto.cnpj.replace(/\D/g, '');
      const empresaExistente = await this.empresaRepo.findOne({
        where: { cnpj: cnpjLimpo },
      });
      if (empresaExistente) {
        throw new ConflictException('CNPJ já cadastrado');
      }
      dto.cnpj = cnpjLimpo;
    }

    const empresa = this.empresaRepo.create({
      ...dto,
      ativo: dto.ativo ?? true,
    });

    const salva = await this.empresaRepo.save(empresa);
    
    try {
      await this.modulosService.habilitarModulosPadrao(salva.id);
    } catch (error) {
      console.error('Erro ao habilitar módulos padrão:', error);
    }
    
    return this.mapToResponse(salva);
  }

  async atualizar(id: string, dto: UpdateEmpresaDto) {
    const empresa = await this.empresaRepo.findOne({ where: { id } });
    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    if (dto.cnpj) {
      const cnpjLimpo = dto.cnpj.replace(/\D/g, '');
      const empresaExistente = await this.empresaRepo.findOne({
        where: { cnpj: cnpjLimpo },
      });
      if (empresaExistente && empresaExistente.id !== id) {
        throw new ConflictException('CNPJ já cadastrado em outra empresa');
      }
      dto.cnpj = cnpjLimpo;
    }

    Object.assign(empresa, dto);
    const atualizada = await this.empresaRepo.save(empresa);
    return this.mapToResponse(atualizada);
  }

  async excluir(id: string) {
    const empresa = await this.empresaRepo.findOne({ where: { id } });
    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    await this.empresaRepo.remove(empresa);
    return { message: 'Empresa excluída com sucesso' };
  }

  async alterarStatus(id: string, ativo: boolean) {
    const empresa = await this.empresaRepo.findOne({ where: { id } });
    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    empresa.ativo = ativo;
    const atualizada = await this.empresaRepo.save(empresa);
    return this.mapToResponse(atualizada);
  }

  private mapToResponse(empresa: EmpresaEntity) {
    return {
      id: empresa.id,
      nome: empresa.nome,
      cnpj: empresa.cnpj,
      razaoSocial: empresa.razaoSocial,
      email: empresa.email,
      telefone: empresa.telefone,
      endereco: empresa.endereco,
      numero: empresa.numero,
      complemento: empresa.complemento,
      bairro: empresa.bairro,
      cidade: empresa.cidade,
      estado: empresa.estado,
      cep: empresa.cep,
      inscricaoEstadual: empresa.inscricaoEstadual,
      inscricaoMunicipal: empresa.inscricaoMunicipal,
      observacoes: empresa.observacoes,
      ativo: empresa.ativo,
      criadoEm: empresa.criadoEm,
      atualizadoEm: empresa.atualizadoEm,
    };
  }
}

