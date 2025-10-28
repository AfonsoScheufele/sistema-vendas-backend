import { Injectable } from '@nestjs/common';
import { Usuario } from '../auth/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>
  ) {}

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find();
  }
}

