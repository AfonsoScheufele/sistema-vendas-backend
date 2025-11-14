import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDepositoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  descricao?: string;

  @IsEnum(['principal', 'filial', 'externo'])
  tipo: 'principal' | 'filial' | 'externo';

  @IsOptional()
  endereco?: Record<string, any>;

  @IsOptional()
  @IsEnum(['ativo', 'inativo'])
  status?: 'ativo' | 'inativo';
}


