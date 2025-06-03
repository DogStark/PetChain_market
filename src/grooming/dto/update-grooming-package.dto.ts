import { PartialType } from '@nestjs/mapped-types';
import { CreateGroomingPackageDto } from './create-grooming-package.dto';

export class UpdateGroomingPackageDto extends PartialType(CreateGroomingPackageDto) {}
