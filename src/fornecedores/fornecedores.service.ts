import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fornecedor } from './fornecedor.entity';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';

@Injectable()
export class FornecedoresService {
  constructor(
    @InjectRepository(Fornecedor)
    private fornecedorRepo: Repository<Fornecedor>,
  ) {}

  async create(createFornecedorDto: CreateFornecedorDto): Promise<Fornecedor> {
    
    const cnpjExiste = await this.fornecedorRepo.findOne({
      where: { cnpj: createFornecedorDto.cnpj.replace(/\D/g, '') }
    });

    if (cnpjExiste) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    const fornecedor = this.fornecedorRepo.create({
      ...createFornecedorDto,
      cnpj: createFornecedorDto.cnpj.replace(/\D/g, ''),
      endereco: {
        ...createFornecedorDto.endereco,
        cep: createFornecedorDto.endereco.cep.replace(/\D/g, ''),
      },
      contato: {
        ...createFornecedorDto.contato,
        telefone: createFornecedorDto.contato.telefone.replace(/\D/g, ''),
        celular: createFornecedorDto.contato.celular?.replace(/\D/g, ''),
      },
      bancario: {
        ...createFornecedorDto.bancario,
        agencia: createFornecedorDto.bancario.agencia.replace(/\D/g, ''),
        conta: createFornecedorDto.bancario.conta.replace(/\D/g, ''),
      },
    });

    return await this.fornecedorRepo.save(fornecedor);
  }

  async findAll(status?: string): Promise<Fornecedor[]> {
    const query = this.fornecedorRepo.createQueryBuilder('fornecedor');

    if (status) {
      query.where('fornecedor.status = :status', { status });
    }

    return await query
      .orderBy('fornecedor.dataCadastro', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepo.findOne({ where: { id } });
    
    if (!fornecedor) {
      throw new NotFoundException(`Fornecedor com ID ${id} não encontrado`);
    }
    
    return fornecedor;
  }

  async update(id: number, updateFornecedorDto: UpdateFornecedorDto): Promise<Fornecedor> {
    const fornecedor = await this.findOne(id);

    
    if (updateFornecedorDto.cnpj && updateFornecedorDto.cnpj !== fornecedor.cnpj) {
      const cnpjExiste = await this.fornecedorRepo.findOne({
        where: { cnpj: updateFornecedorDto.cnpj.replace(/\D/g, '') }
      });

      if (cnpjExiste) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    const dadosAtualizados = {
      ...updateFornecedorDto,
      cnpj: updateFornecedorDto.cnpj ? updateFornecedorDto.cnpj.replace(/\D/g, '') : undefined,
      endereco: updateFornecedorDto.endereco ? {
        ...updateFornecedorDto.endereco,
        cep: updateFornecedorDto.endereco.cep?.replace(/\D/g, ''),
      } : undefined,
      contato: updateFornecedorDto.contato ? {
        ...updateFornecedorDto.contato,
        telefone: updateFornecedorDto.contato.telefone?.replace(/\D/g, ''),
        celular: updateFornecedorDto.contato.celular?.replace(/\D/g, ''),
      } : undefined,
      bancario: updateFornecedorDto.bancario ? {
        ...updateFornecedorDto.bancario,
        agencia: updateFornecedorDto.bancario.agencia?.replace(/\D/g, ''),
        conta: updateFornecedorDto.bancario.conta?.replace(/\D/g, ''),
      } : undefined,
    };

    Object.assign(fornecedor, dadosAtualizados);
    return await this.fornecedorRepo.save(fornecedor);
  }

  async remove(id: number): Promise<{ message: string }> {
    const fornecedor = await this.findOne(id);
    await this.fornecedorRepo.remove(fornecedor);
    return { message: 'Fornecedor removido com sucesso' };
  }

  async ativar(id: number): Promise<Fornecedor> {
    const fornecedor = await this.findOne(id);
    fornecedor.status = 'ativo';
    return await this.fornecedorRepo.save(fornecedor);
  }

  async inativar(id: number): Promise<Fornecedor> {
    const fornecedor = await this.findOne(id);
    fornecedor.status = 'inativo';
    return await this.fornecedorRepo.save(fornecedor);
  }

  async bloquear(id: number, motivo: string): Promise<Fornecedor> {
    const fornecedor = await this.findOne(id);
    fornecedor.status = 'bloqueado';
    fornecedor.observacoes = `${fornecedor.observacoes || ''}\nBloqueado em ${new Date().toISOString()}: ${motivo}`.trim();
    return await this.fornecedorRepo.save(fornecedor);
  }

  async obterProdutos(id: number): Promise<any[]> {
    const fornecedor = await this.findOne(id);
    return fornecedor.produtos || [];
  }

  async adicionarProduto(id: number, produto: any): Promise<Fornecedor> {
    const fornecedor = await this.findOne(id);
    
    if (!fornecedor.produtos) {
      fornecedor.produtos = [];
    }

    fornecedor.produtos.push(produto);
    return await this.fornecedorRepo.save(fornecedor);
  }

  async removerProduto(id: number, produtoId: number): Promise<Fornecedor> {
    const fornecedor = await this.findOne(id);
    
    if (fornecedor.produtos) {
      fornecedor.produtos = fornecedor.produtos.filter(p => p.id !== produtoId);
    }

    return await this.fornecedorRepo.save(fornecedor);
  }
}
