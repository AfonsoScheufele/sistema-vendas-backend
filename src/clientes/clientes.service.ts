import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const emailExiste = await this.clienteRepo.findOne({
      where: { email: createClienteDto.email.toLowerCase() }
    });

    if (emailExiste) {
      throw new ConflictException('Email já cadastrado');
    }

    const cliente = this.clienteRepo.create({
      ...createClienteDto,
      email: createClienteDto.email.toLowerCase(),
      telefone: createClienteDto.telefone.replace(/\D/g, ''),
      cpf_cnpj: createClienteDto.cpf_cnpj ? createClienteDto.cpf_cnpj.replace(/\D/g, '') : undefined,
    });

    return await this.clienteRepo.save(cliente);
  }

  async findAll(filtros?: { tipo?: string; ativo?: string; search?: string }): Promise<Cliente[]> {
    const query = this.clienteRepo.createQueryBuilder('cliente');
    
    if (filtros?.tipo) {
      query.andWhere('cliente.tipo = :tipo', { tipo: filtros.tipo });
    }
    
    if (filtros?.ativo !== undefined) {
      const ativo = filtros.ativo === 'true';
      query.andWhere('cliente.ativo = :ativo', { ativo });
    }
    
    if (filtros?.search) {
      query.andWhere('(cliente.nome ILIKE :search OR cliente.email ILIKE :search)', { 
        search: `%${filtros.search}%` 
      });
    }
    
    return query.orderBy('cliente.criadoEm', 'DESC').getMany();
  }

  async getTipos() {
    const result = await this.clienteRepo
      .createQueryBuilder('cliente')
      .select('DISTINCT cliente.tipo', 'tipo')
      .getRawMany();
    
    return result.map(item => item.tipo);
  }

  async getClientesNovos(periodo?: string) {
    const query = this.clienteRepo.createQueryBuilder('cliente');
    
    if (periodo === 'mes') {
      query.andWhere('cliente.criadoEm >= :dataInicio', {
        dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      });
    } else if (periodo === 'semana') {
      query.andWhere('cliente.criadoEm >= :dataInicio', {
        dataInicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      });
    }
    
    return query.orderBy('cliente.criadoEm', 'DESC').getMany();
  }

  async getVendasCliente(id: number) {
    const cliente = await this.findOne(id);
    
    return {
      cliente,
      vendas: [],
      totalVendas: 0
    };
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepo.findOne({ where: { id } });
    
    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    
    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);

    if (updateClienteDto.email && updateClienteDto.email.toLowerCase() !== cliente.email) {
      const emailExiste = await this.clienteRepo.findOne({
        where: { email: updateClienteDto.email.toLowerCase() }
      });

      if (emailExiste) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    const dadosAtualizados = {
      ...updateClienteDto,
      email: updateClienteDto.email ? updateClienteDto.email.toLowerCase() : undefined,
      telefone: updateClienteDto.telefone ? updateClienteDto.telefone.replace(/\D/g, '') : undefined,
      cpf_cnpj: updateClienteDto.cpf_cnpj ? updateClienteDto.cpf_cnpj.replace(/\D/g, '') : undefined,
    };

    Object.assign(cliente, dadosAtualizados);
    return await this.clienteRepo.save(cliente);
  }

  async remove(id: number): Promise<{ message: string }> {
    const cliente = await this.findOne(id);
    await this.clienteRepo.remove(cliente);
    return { message: 'Cliente removido com sucesso' };
  }

  async getStats() {
    const totalClientes = await this.clienteRepo.count();
    
    const clientesRecentes = await this.clienteRepo.count({
      where: {
        criadoEm: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) as any
      }
    });
    
    return {
      totalClientes,
      clientesRecentes,
    };
  }
}