import { PartialType } from '@nestjs/mapped-types';
import { CreateComissaoDto } from './create-comissao.dto';

export class UpdateComissaoDto extends PartialType(CreateComissaoDto) {}



