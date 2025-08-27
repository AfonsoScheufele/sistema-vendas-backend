import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,
  ) {}

  create(dto: CreateClienteDto) {
    const cliente = this.clienteRepo.create(dto);
    return this.clienteRepo.save(cliente);
  }

  findAll() {
    return this.clienteRepo.find();
  }

  findOne(id: number) {
    return this.clienteRepo.findOneBy({ id });
  }

  async update(id: number, dto: Partial<CreateClienteDto>) {
    await this.clienteRepo.update(id, dto);
    return this.findOne(id);
  }

  delete(id: number) {
    return this.clienteRepo.delete(id);
  }
}
