import { IsNotEmpty, IsString, IsEmail, IsEnum, IsOptional, ValidateNested, IsObject, MinLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';

class EnderecoDto {
  @IsNotEmpty({ message: 'Logradouro é obrigatório' })
  @IsString()
  logradouro!: string;

  @IsNotEmpty({ message: 'Número é obrigatório' })
  @IsString()
  numero!: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsNotEmpty({ message: 'Bairro é obrigatório' })
  @IsString()
  bairro!: string;

  @IsNotEmpty({ message: 'Cidade é obrigatória' })
  @IsString()
  cidade!: string;

  @IsNotEmpty({ message: 'Estado é obrigatório' })
  @IsString()
  @MinLength(2, { message: 'Estado deve ter 2 caracteres' })
  estado!: string;

  @IsNotEmpty({ message: 'CEP é obrigatório' })
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP deve ter formato válido' })
  cep!: string;
}

class ContatoDto {
  @IsNotEmpty({ message: 'Nome do contato é obrigatório' })
  @IsString()
  nome!: string;

  @IsNotEmpty({ message: 'Cargo é obrigatório' })
  @IsString()
  cargo!: string;

  @IsNotEmpty({ message: 'Telefone é obrigatório' })
  @IsString()
  telefone!: string;

  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email deve ter formato válido' })
  email!: string;

  @IsOptional()
  @IsString()
  celular?: string;
}

class BancarioDto {
  @IsNotEmpty({ message: 'Banco é obrigatório' })
  @IsString()
  banco!: string;

  @IsNotEmpty({ message: 'Agência é obrigatória' })
  @IsString()
  agencia!: string;

  @IsNotEmpty({ message: 'Conta é obrigatória' })
  @IsString()
  conta!: string;

  @IsNotEmpty({ message: 'Tipo de conta é obrigatório' })
  @IsEnum(['corrente', 'poupanca'], { message: 'Tipo de conta deve ser corrente ou poupanca' })
  tipoConta!: 'corrente' | 'poupanca';
}

export class CreateFornecedorDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  nome!: string;

  @IsNotEmpty({ message: 'Razão social é obrigatória' })
  @IsString()
  razaoSocial!: string;

  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, { message: 'CNPJ deve ter formato válido' })
  cnpj!: string;

  @IsOptional()
  @IsString()
  inscricaoEstadual?: string;

  @IsOptional()
  @IsString()
  inscricaoMunicipal?: string;

  @IsNotEmpty({ message: 'Endereço é obrigatório' })
  @ValidateNested()
  @Type(() => EnderecoDto)
  endereco!: EnderecoDto;

  @IsNotEmpty({ message: 'Contato é obrigatório' })
  @ValidateNested()
  @Type(() => ContatoDto)
  contato!: ContatoDto;

  @IsNotEmpty({ message: 'Dados bancários são obrigatórios' })
  @ValidateNested()
  @Type(() => BancarioDto)
  bancario!: BancarioDto;

  @IsNotEmpty({ message: 'Categoria é obrigatória' })
  @IsString()
  categoria!: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
