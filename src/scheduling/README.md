# Advanced Appointment Availability Management

This module implements a comprehensive appointment availability management system for veterinarians in the PetChain Market application. It provides flexible scheduling capabilities with support for recurring patterns, time slot management, exception handling, and configuration options.

## Features

### 1. Schedule Patterns
- Define recurring availability patterns (daily, weekly, biweekly, monthly, custom)
- Support for complex recurrence rules
- Link patterns to veterinarian availability schedules

### 2. Time Slot Management
- Create and manage individual appointment time slots
- Support for different slot statuses (available, booked, blocked, break, holiday)
- Batch operations for efficient slot generation
- Conflict detection and prevention

### 3. Schedule Exceptions
- Manage breaks, holidays, and other exceptions to regular schedules
- Support for recurring exceptions
- Automatic time slot blocking based on exceptions

### 4. Scheduling Configuration
- Global and veterinarian-specific configuration options
- Customizable slot duration, buffer times, and booking policies
- Working hours and break time definitions
- Cancellation policies and advance booking limits

### 5. Conflict Resolution
- Automatic detection and resolution of scheduling conflicts
- Priority-based conflict resolution strategies
- Error reporting for unresolvable conflicts

## API Endpoints

### Schedule Patterns
- `POST /schedule-patterns` - Create a new schedule pattern
- `GET /schedule-patterns` - Get all schedule patterns
- `GET /schedule-patterns/:id` - Get a schedule pattern by ID
- `GET /schedule-patterns/availability-schedule/:id` - Get patterns by availability schedule ID
- `GET /schedule-patterns/:id/occurrences` - Get occurrence dates for a pattern
- `PATCH /schedule-patterns/:id` - Update a schedule pattern
- `DELETE /schedule-patterns/:id` - Delete a schedule pattern
- `PATCH /schedule-patterns/:id/deactivate` - Deactivate a schedule pattern

### Time Slots
- `POST /time-slots` - Create a new time slot
- `POST /time-slots/batch` - Create multiple time slots in a batch
- `GET /time-slots` - Get all time slots
- `GET /time-slots/date-range` - Get time slots by date range
- `GET /time-slots/available` - Get available time slots by date range
- `GET /time-slots/veterinarian/:id` - Get time slots by veterinarian and date range
- `GET /time-slots/availability-schedule/:id` - Get time slots by availability schedule ID
- `GET /time-slots/:id` - Get a time slot by ID
- `PATCH /time-slots/:id` - Update a time slot
- `DELETE /time-slots/:id` - Delete a time slot
- `PATCH /time-slots/:id/deactivate` - Deactivate a time slot
- `PATCH /time-slots/:id/book` - Book a time slot
- `PATCH /time-slots/:id/block` - Block a time slot
- `PATCH /time-slots/:id/break` - Mark a time slot as break
- `PATCH /time-slots/:id/holiday` - Mark a time slot as holiday
- `PATCH /time-slots/:id/release` - Release a time slot (make it available again)

### Schedule Exceptions
- `POST /schedule-exceptions` - Create a new schedule exception
- `GET /schedule-exceptions` - Get all schedule exceptions
- `GET /schedule-exceptions/type/:type` - Get schedule exceptions by type
- `GET /schedule-exceptions/date-range` - Get schedule exceptions by date range
- `GET /schedule-exceptions/veterinarian/:id` - Get schedule exceptions by veterinarian
- `GET /schedule-exceptions/veterinarian/:id/date-range` - Get exceptions by veterinarian and date range
- `GET /schedule-exceptions/holidays/:year` - Get holidays for a specific year
- `GET /schedule-exceptions/breaks/:veterinarianId` - Get break times for a veterinarian on a specific date
- `GET /schedule-exceptions/:id` - Get a schedule exception by ID
- `GET /schedule-exceptions/:id/occurrences` - Get occurrence dates for a recurring exception
- `PATCH /schedule-exceptions/:id` - Update a schedule exception
- `DELETE /schedule-exceptions/:id` - Delete a schedule exception
- `PATCH /schedule-exceptions/:id/deactivate` - Deactivate a schedule exception

### Scheduling Configuration
- `POST /scheduling-config` - Create a new scheduling configuration
- `GET /scheduling-config` - Get all scheduling configurations
- `GET /scheduling-config/global` - Get global scheduling configuration
- `GET /scheduling-config/veterinarian/:id` - Get scheduling configuration for a veterinarian
- `GET /scheduling-config/effective/:veterinarianId` - Get effective scheduling configuration
- `GET /scheduling-config/:id` - Get a scheduling configuration by ID
- `PATCH /scheduling-config/:id` - Update a scheduling configuration
- `DELETE /scheduling-config/:id` - Delete a scheduling configuration
- `PATCH /scheduling-config/:id/deactivate` - Deactivate a scheduling configuration

### Scheduling Operations
- `POST /scheduling/generate-slots/:veterinarianId` - Generate time slots for a veterinarian
- `GET /scheduling/availability/:veterinarianId` - Check availability for a veterinarian
- `POST /scheduling/block-slots/:veterinarianId` - Block time slots for a veterinarian
- `POST /scheduling/break/:veterinarianId` - Add break time for a veterinarian
- `POST /scheduling/holiday/:veterinarianId` - Add holiday for a veterinarian
- `POST /scheduling/resolve-conflicts/:veterinarianId` - Resolve scheduling conflicts

## Usage Examples

### Creating a Weekly Schedule Pattern

```typescript
// Create a weekly schedule pattern for a veterinarian
const schedulePattern = {
  name: "Regular Office Hours",
  description: "Standard weekly availability",
  recurrenceType: "WEEKLY",
  recurrenceRule: {
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    interval: 1
  },
  startDate: "2025-06-01T00:00:00.000Z",
  endDate: "2025-12-31T00:00:00.000Z",
  availabilityScheduleId: 123,
  isActive: true
};

// POST to /schedule-patterns
```

### Generating Time Slots

```typescript
// Generate time slots for the next two weeks
const generateSlots = {
  startDate: "2025-06-04T00:00:00.000Z",
  endDate: "2025-06-18T00:00:00.000Z"
};

// POST to /scheduling/generate-slots/123
```

### Adding a Holiday

```typescript
// Add a holiday for a veterinarian
const holiday = {
  startTime: "2025-07-04T00:00:00.000Z",
  endTime: "2025-07-04T23:59:59.000Z",
  title: "Independence Day",
  description: "Office closed for Independence Day",
  isRecurring: true,
  recurrenceRule: {
    frequency: "YEARLY"
  }
};

// POST to /scheduling/holiday/123
```

### Checking Availability

```typescript
// Check availability for a specific date range
// GET /scheduling/availability/123?startDate=2025-06-10T00:00:00.000Z&endDate=2025-06-10T23:59:59.000Z
```

## Integration with Existing Modules

This scheduling module integrates with the existing Veterinarian and Staff Module, specifically using the `AvailabilitySchedule` entity to build upon the basic scheduling functionality already present in the system.

## Security

All endpoints are protected with JWT authentication and role-based access control:
- Admin users have full access to all endpoints
- Veterinarians can manage their own schedules
- Staff members can view and manage schedules based on their permissions
- Clients can only view available time slots and check availability

## Future Enhancements

- Calendar view integration
- SMS/Email notifications for schedule changes
- Client-facing appointment booking integration
- Analytics for schedule utilization
- Mobile app integration
