import { IsNotEmpty, IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateClienteDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  nome!: string;

  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @IsString()
  telefone!: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  cpf_cnpj?: string;
}