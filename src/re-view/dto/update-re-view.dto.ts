import { PartialType } from '@nestjs/mapped-types';
import { CreateReViewDto } from './create-re-view.dto';

export class UpdateReViewDto extends PartialType(CreateReViewDto) {}
