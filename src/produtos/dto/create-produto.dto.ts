import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateProdutoDto {
  @IsNotEmpty()
  @IsString()
  nome!: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  preco!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precoCusto?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estoque?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estoqueMinimo?: number;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  codigoBarras?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  unidade?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantidadePorCaixa?: number;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  imagem?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  peso?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  largura?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  altura?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  profundidade?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  ativo?: boolean;
}
