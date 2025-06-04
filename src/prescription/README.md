# Prescription Management System for Veterinarians

This module implements a comprehensive prescription management system for veterinarians within the PetChain Market platform.

## Features

- **Prescription Creation**: Veterinarians can create detailed prescriptions for pets
- **Prescription Fulfillment**: Track prescription fulfillment status
- **Prescription History**: Maintain complete prescription history for each pet
- **Refill Management**: Handle prescription refill requests and approvals
- **Prescription Validation**: Validate prescriptions for expiration and refill limits

## Entities

### Prescription

The main entity that stores prescription information:

- Basic prescription details (name, dosage, frequency, instructions)
- Start/end dates and duration
- Refill limits and tracking
- Status management (pending, active, fulfilled, completed, cancelled, expired)
- Relationships to pets and veterinarians

### PrescriptionRefill

Tracks refill requests and their processing:

- Refill request information
- Status tracking (requested, approved, fulfilled, denied)
- Notes and timestamps
- Relationships to prescriptions and users

## API Endpoints

### Prescriptions

- `POST /prescriptions` - Create a new prescription
- `GET /prescriptions` - Get all prescriptions created by the current veterinarian
- `GET /prescriptions/pet/:petId` - Get prescriptions for a specific pet
- `GET /prescriptions/:id` - Get prescription by ID
- `PATCH /prescriptions/:id` - Update prescription
- `DELETE /prescriptions/:id` - Delete prescription
- `POST /prescriptions/:id/fulfill` - Fulfill a prescription

### Prescription Refills

- `POST /prescriptions/refill` - Request a prescription refill
- `PATCH /prescriptions/refill/:id` - Process a prescription refill request
- `GET /prescriptions/:id/refill-history` - Get refill history for a prescription

## Workflow

1. **Prescription Generation**:
   - Veterinarian creates a prescription for a pet
   - System validates the prescription data
   - Prescription is saved with PENDING status

2. **Prescription Fulfillment**:
   - Staff member fulfills the prescription
   - Prescription status is updated to ACTIVE
   - Fulfillment details are recorded

3. **Refill Management**:
   - Pet owner requests a refill if allowed
   - Veterinarian approves or denies the refill
   - If approved, refill count is updated

4. **Prescription History**:
   - Complete history of prescriptions is maintained
   - All refill requests and their status are tracked

## Implementation Details

The prescription system is integrated with the existing pet and user management systems. It provides a complete solution for veterinarians to manage medications for their animal patients.

## Security

All prescription endpoints are secured with JWT authentication to ensure that only authorized users can access and modify prescription data.
