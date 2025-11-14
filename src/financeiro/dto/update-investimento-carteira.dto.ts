import { PartialType } from '@nestjs/mapped-types';
import { CreateInvestimentoCarteiraDto } from './create-investimento-carteira.dto';

export class UpdateInvestimentoCarteiraDto extends PartialType(CreateInvestimentoCarteiraDto) {}

