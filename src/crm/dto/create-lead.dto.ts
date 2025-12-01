import { IsNotEmpty, IsString, IsEmail, IsOptional, IsIn } from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  nome!: string;

  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @IsString()
  telefone!: string;

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsOptional()
  @IsString()
  origem?: string;

  @IsOptional()
  @IsString()
  @IsIn(['novo', 'contatado', 'qualificado', 'proposta', 'convertido', 'perdido'])
  status?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  score?: number;
}


