import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class FornecedorDto {
  @IsNotEmpty()
  @IsString()
  nome!: string;

  @IsNotEmpty()
  @IsString()
  cnpj!: string;

  @IsNotEmpty()
  @IsString()
  contato!: string;

  @IsNotEmpty()
  @IsString()
  email!: string;

  @IsNotEmpty()
  @IsString()
  telefone!: string;
}

class ItemDto {
  @IsNotEmpty()
  produtoId!: number;

  @IsNotEmpty()
  @IsString()
  nomeProduto!: string;

  @IsNotEmpty()
  quantidade!: number;

  @IsNotEmpty()
  @IsString()
  unidade!: string;

  @IsOptional()
  @IsString()
  especificacoes?: string;
}

export class CreateCotacaoDto {
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString()
  descricao!: string;

  @IsArray({ message: 'Fornecedores deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => FornecedorDto)
  fornecedores!: FornecedorDto[];

  @IsArray({ message: 'Itens deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  itens!: ItemDto[];

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  status?: string;
}