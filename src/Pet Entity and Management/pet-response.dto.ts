import { Expose, Transform } from 'class-transformer';

export class PetResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  species: string;

  @Expose()
  breed?: string;

  @Expose()
  age: number;

  @Expose()
  gender: string;

  @Expose()
  @Transform(({ value }) => parseFloat(value))
  weight: number;

  @Expose()
  photoUrl?: string;

  @Expose()
  ownerId: number;

  @Expose()
  owner?: {
    id: number;
    name: string;
    email: string;
  };

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
