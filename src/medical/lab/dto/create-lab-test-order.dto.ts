export class CreateLabTestOrderDto {
  petId!: number;
  orderedByUserId!: number;
  testType!: string;
  notes?: string;

  constructor() {
    // Initialize if needed
  }
} 