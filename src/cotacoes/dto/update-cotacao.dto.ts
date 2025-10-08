import { PartialType } from '@nestjs/mapped-types';
import { CreateCotacaoDto } from './create-cotacao.dto';
import { IsOptional, IsEnum, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateCotacaoDto extends PartialType(CreateCotacaoDto) {
  @IsOptional()
  @IsEnum(['aberta', 'em_analise', 'concluida', 'cancelada'], { 
    message: 'Status deve ser aberta, em_analise, concluida ou cancelada' 
  })
  status?: 'aberta' | 'em_analise' | 'concluida' | 'cancelada';
}

export class AdicionarPropostaDto {
  @IsNotEmpty({ message: 'ID do fornecedor é obrigatório' })
  fornecedorId!: number;

  @IsNotEmpty({ message: 'Valor total é obrigatório' })
  valorTotal!: number;

  @IsNotEmpty({ message: 'Prazo de entrega é obrigatório' })
  prazoEntrega!: number;

  @IsNotEmpty({ message: 'Condições de pagamento são obrigatórias' })
  condicoesPagamento!: string;

  @IsOptional()
  observacoes?: string;
}

export class SelecionarVencedoraDto {
  @IsNotEmpty({ message: 'ID da proposta é obrigatório' })
  propostaId!: number;
}
