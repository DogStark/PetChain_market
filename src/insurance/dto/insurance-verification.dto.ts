import { IsString, IsDateString } from 'class-validator';

export class VerifyInsuranceDto {
  @IsString()
  policyNumber: string | undefined;

  @IsString()
  petName: string | undefined;

  @IsDateString()
  petDateOfBirth: Date | undefined;

  @IsString()
  ownerName: string | undefined;
}
