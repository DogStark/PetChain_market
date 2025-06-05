import { IsString, IsDateString, IsInt } from 'class-validator';

export class CreateAppointmentDto {
@IsString()
patientName: string;

@IsString()
serviceType: string;

@IsDateString()
scheduledAt: string;

@IsInt()
locationId: number;

constructor(
     patientName: string,
     serviceType: string,
     scheduledAt: string,
     locationId: number
) {
     this.patientName = patientName;
     this.serviceType = serviceType;
     this.scheduledAt = scheduledAt;
     this.locationId = locationId;
}
}
