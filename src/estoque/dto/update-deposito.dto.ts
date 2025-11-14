import { PartialType } from '@nestjs/mapped-types';
import { CreateDepositoDto } from './create-deposito.dto';

export class UpdateDepositoDto extends PartialType(CreateDepositoDto) {}


