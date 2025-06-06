import type { AppointmentStatus, AppointmentType } from "../entities/appointment.entity"

export class AppointmentResponseDto {
  id: string
  veterinarian_id: string
  client_id: string
  pet_id: string
  appointment_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  appointment_type: AppointmentType
  status: AppointmentStatus
  reason?: string
  notes?: string
  veterinarian_notes?: string
  estimated_cost?: number
  actual_cost?: number
  is_emergency: boolean
  booking_source: string
  confirmed_at?: Date
  cancelled_at?: Date
  cancellation_reason?: string
  created_at: Date
  updated_at: Date

  // Related entities
  veterinarian?: {
    id: string
    full_name: string
    specialization?: string
    email: string
    phone?: string
  }

  client?: {
    id: string
    full_name: string
    email: string
    phone: string
  }

  pet?: {
    id: string
    name: string
    species: string
    breed?: string
  }
}

export class AvailabilitySlotDto {
  start_time: string
  end_time: string
  is_available: boolean
  appointment_id?: string
}

export class VeterinarianAvailabilityDto {
  veterinarian_id: string
  veterinarian_name: string
  date: string
  slots: AvailabilitySlotDto[]
}
