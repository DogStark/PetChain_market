export class CreateLabResultDto {
  resultData: any;
  uploadedByUserId!: number;
  interpretation?: string;
  reportUrl?: string;

  constructor() {
    // Initialize if needed
  }
} 