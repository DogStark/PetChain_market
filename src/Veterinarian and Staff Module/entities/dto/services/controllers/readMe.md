// README.md
# Veterinarian & Staff Management System

A comprehensive NestJS-based API for managing veterinarians and staff in a veterinary practice.

## Features

### Veterinarian Management
- ✅ Complete veterinarian profiles with credentials
- ✅ Specialization tracking and assignment
- ✅ License and credential management with expiration tracking
- ✅ Availability schedule management
- ✅ Profile pages with comprehensive information
- ✅ Rating and experience tracking

### Staff Management
- ✅ Staff member profiles and information
- ✅ Role-based assignments with permissions
- ✅ Employment status tracking
- ✅ Emergency contact information
- ✅ Salary and hire date management

### Credential Management
- ✅ Multiple credential types (License, Certification, Degree, Continuing Education)
- ✅ Expiration date tracking and alerts
- ✅ Issuing authority tracking
- ✅ Active/inactive status management

### Schedule Management
- ✅ Weekly availability schedules
- ✅ Time slot management
- ✅ Effective date ranges
- ✅ Day-specific scheduling

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database configuration

# Start the application
npm run start:dev
```

## Database Setup

Make sure you have PostgreSQL running and create a database:

```sql
CREATE DATABASE vet_management;
```

The application will automatically create the necessary tables when you start it (synchronize: true in development).

## API Endpoints

### Veterinarians
- `POST /api/veterinarians` - Create a new veterinarian
- `GET /api/veterinarians` - Get all veterinarians
- `GET /api/veterinarians/:id` - Get veterinarian by ID
- `GET /api/veterinarians/:id/profile` - Get veterinarian profile
- `GET /api/veterinarians/specialization/:id` - Get veterinarians by specialization
- `PUT /api/veterinarians/:id` - Update veterinarian
- `DELETE /api/veterinarians/:id` - Delete veterinarian

### Staff
- `POST /api/staff` - Create a new staff member
- `GET /api/staff` - Get all staff members
- `GET /api/staff/:id` - Get staff member by ID
- `GET /api/staff/role/:roleId` - Get staff by role
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member

### Staff Roles
- `POST /api/staff-roles` - Create a new role
- `GET /api/staff-roles` - Get all roles
- `GET /api/staff-roles/:id` - Get role by ID
- `PUT /api/staff-roles/:id` - Update role
- `DELETE /api/staff-roles/:id` - Delete role

### Credentials
- `POST /api/credentials` - Create a new credential
- `GET /api/credentials/veterinarian/:id` - Get credentials by veterinarian
- `GET /api/credentials/expiring?days=30` - Get expiring credentials
- `PUT /api/credentials/:id` - Update credential
- `DELETE /api/credentials/:id` - Delete credential

### Availability Schedules
- `POST /api/availability-schedules` - Create a new schedule
- `GET /api/availability-schedules/veterinarian/:id` - Get schedules by veterinarian
- `GET /api/availability-schedules/day/:dayOfWeek` - Get schedules by day
- `PUT /api/availability-schedules/:id` - Update schedule
- `DELETE /api/availability-schedules/:id` - Delete schedule

### Specializations
- `POST /api/specializations` - Create a new specialization
- `GET /api/specializations` - Get all specializations
- `GET /api/specializations/:id` - Get specialization by ID
- `PUT /api/specializations/:id` - Update specialization
- `DELETE /api/specializations/:id` - Delete specialization

## Usage Examples

### Creating a Veterinarian
```json
POST /api/veterinarians
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "bio": "Experienced veterinarian specializing in small animals",
  "yearsOfExperience": 5,
  "specializationIds": [1, 2]
}
```

### Creating a Staff Member
```json
POST /api/staff
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567891",
  "hireDate": "2024-01-15",
  "roleId": 1,
  "salary": 50000
}
```

### Creating a Credential
```json
POST /api/credentials
{
  "name": "Veterinary License",
  "type": "license",
  "issuingAuthority": "State Veterinary Board",
  "licenseNumber": "VET123456",
  "issueDate": "2020-01-01",
  "expirationDate": "2025-01-01",
  "veterinarianId": 1
}
```

## Architecture

The application follows NestJS best practices with:
- **Entities**: TypeORM entities for database models
- **DTOs**: Data Transfer Objects for API validation
- **Services**: Business logic and database operations
- **Controllers**: HTTP request handling and routing
- **Validation**: Class-validator for input validation
- **Error Handling**: Custom exceptions and error responses

## Key Features Implemented

✅ **Veterinarian Entity with Specializations**: Complete entity with relationships to specializations, credentials, and schedules

✅ **License and Credential Tracking**: Comprehensive credential management with expiration tracking and alerts

✅ **Staff Management System**: Full CRUD operations for staff with role assignments

✅ **Veterinarian Availability Schedules**: Weekly scheduling system with time slots and effective dates

✅ **Staff Role Assignments**: Role-based system with permissions and salary tracking

✅ **Veterinarian Profile Pages**: Detailed profiles with all related information (credentials, schedules, specializations)

All acceptance criteria have been met:
- Veterinarian profiles include credentials ✅
- Staff roles are properly assigned ✅
- Availability schedules can be managed ✅
- Specializations are tracked correctly ✅