import { PartialType } from '@nestjs/mapped-types';
import { CreateInvestimentoAtivoDto } from './create-investimento-ativo.dto';

export class UpdateInvestimentoAtivoDto extends PartialType(CreateInvestimentoAtivoDto) {}

