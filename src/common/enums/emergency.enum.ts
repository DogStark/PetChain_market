export enum EmergencyPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TriageLevel {
  IMMEDIATE = 1, // Life-threatening
  URGENT = 2, // Within 30 minutes
  LESS_URGENT = 3, // Within 2 hours
  NON_URGENT = 4, // Within 24 hours
}
