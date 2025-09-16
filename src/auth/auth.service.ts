import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUsuarioDto) {
    const existe = await this.usuarioRepo.findOneBy({ email: dto.email });
    if (existe) throw new UnauthorizedException('Email já cadastrado');

    const hash = await bcrypt.hash(dto.senha, 10);

    const usuario = this.usuarioRepo.create({ email: dto.email, senha: hash });
    return this.usuarioRepo.save(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuarioRepo.findOneBy({ email: dto.email });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    const valido = await bcrypt.compare(dto.senha, usuario.senha);
    if (!valido) throw new UnauthorizedException('Senha inválida');

    const payload = { sub: usuario.id, email: usuario.email };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validateUser(id: number) {
    return this.usuarioRepo.findOneBy({ id });
  }
}
