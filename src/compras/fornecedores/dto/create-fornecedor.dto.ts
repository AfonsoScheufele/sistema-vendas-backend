import { IsNotEmpty, IsString, IsOptional, IsEnum, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { FornecedorCategoria, FornecedorStatus } from '../fornecedor.interface';

class EnderecoDto {
  @IsNotEmpty()
  @IsString()
  logradouro!: string;

  @IsNotEmpty()
  @IsString()
  numero!: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsNotEmpty()
  @IsString()
  bairro!: string;

  @IsNotEmpty()
  @IsString()
  cidade!: string;

  @IsNotEmpty()
  @IsString()
  estado!: string;

  @IsNotEmpty()
  @IsString()
  cep!: string;
}

class ContatoDto {
  @IsNotEmpty()
  @IsString()
  nome!: string;

  @IsNotEmpty()
  @IsString()
  cargo!: string;

  @IsNotEmpty()
  @IsString()
  telefone!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  celular?: string;
}

class BancarioDto {
  @IsNotEmpty()
  @IsString()
  banco!: string;

  @IsNotEmpty()
  @IsString()
  agencia!: string;

  @IsNotEmpty()
  @IsString()
  conta!: string;

  @IsNotEmpty()
  @IsEnum(['corrente', 'poupanca'])
  tipoConta!: 'corrente' | 'poupanca';
}

export class CreateFornecedorDto {
  @IsNotEmpty()
  @IsString()
  nome!: string;

  @IsNotEmpty()
  @IsString()
  razaoSocial!: string;

  @IsNotEmpty()
  @IsString()
  cnpj!: string;

  @IsOptional()
  @IsString()
  inscricaoEstadual?: string;

  @IsOptional()
  @IsString()
  inscricaoMunicipal?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EnderecoDto)
  endereco!: EnderecoDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ContatoDto)
  contato!: ContatoDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => BancarioDto)
  bancario!: BancarioDto;

  @IsNotEmpty()
  @IsEnum(['geral', 'tecnologia', 'logistica', 'servicos', 'materiais'])
  categoria!: FornecedorCategoria;

  @IsNotEmpty()
  @IsEnum(['ativo', 'inativo', 'bloqueado'])
  status!: FornecedorStatus;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  produtos?: Array<{
    id: number;
    nome: string;
    categoria: string;
    precoMedio: number;
  }>;
}
