import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateComissaoVendedorDto {
  @IsNumber()
  @IsPositive()
  vendedorId: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  vendedorNome?: string;

  @IsEnum(['percentual', 'fixo', 'misto'])
  tipo: 'percentual' | 'fixo' | 'misto';

  @IsOptional()
  @IsNumber()
  percentual?: number;

  @IsOptional()
  @IsNumber()
  valorFixo?: number;
}

export class CreateComissaoDto {
  @IsNumber()
  @IsPositive()
  produtoId: number;

  @IsEnum(['percentual', 'fixo'])
  tipoComissaoBase: 'percentual' | 'fixo';

  @IsNumber()
  comissaoBase: number;

  @IsNumber()
  comissaoMinima: number;

  @IsOptional()
  @IsNumber()
  comissaoMaxima?: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => CreateComissaoVendedorDto)
  vendedores?: CreateComissaoVendedorDto[];
}



