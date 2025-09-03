import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepo: Repository<Produto>,
  ) {}

  create(dto: CreateProdutoDto) {
    const produto = this.produtoRepo.create(dto);
    return this.produtoRepo.save(produto);
  }

  findAll() {
    return this.produtoRepo.find();
  }

  findOne(id: number) {
    return this.produtoRepo.findOneBy({ id });
  }

  async update(id: number, dto: UpdateProdutoDto) {
    await this.produtoRepo.update(id, dto);
    return this.findOne(id);
  }

  delete(id: number) {
    return this.produtoRepo.delete(id);
  }
}
