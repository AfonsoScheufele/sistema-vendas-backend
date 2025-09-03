import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProdutoDto {
  @IsNotEmpty()
  @IsString()
  nome!: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsNotEmpty()
  @IsNumber()
  preco!: number;

  @IsOptional()
  @IsNumber()
  estoque?: number;

  @IsOptional()
  @IsString()
  categoria?: string;
}
