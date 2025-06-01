import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
    UploadedFile,
    UseInterceptors,
    ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BoardingService } from './boarding.service';
import { ActivityService } from './activity.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('boarding')
@Controller('boarding')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BoardingController {
    constructor(
        private readonly boardingService: BoardingService,
        private readonly activityService: ActivityService,
    ) { }

    @Post('bookings')
    @ApiOperation({ summary: 'Create a new boarding booking' })
    @ApiResponse({ status: 201, description: 'Booking created successfully' })
    async createBooking(@Body() createBookingDto: CreateBookingDto, @Request() req) {
        return this.boardingService.createBooking(createBookingDto, req.user.id);
    }

    @Get('bookings')
    @ApiOperation({ summary: 'Get all bookings for the current user' })
    async getMyBookings(@Request() req, @Query('status') status?: string) {
        return this.boardingService.getBookingsByOwner(req.user.id, status);
    }

    @Get('bookings/:id')
    @ApiOperation({ summary: 'Get booking details' })
    async getBooking(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
        return this.boardingService.getBookingById(id, req.user.id);
    }

    @Patch('bookings/:id/check-in')
    @UseGuards(RolesGuard)
    @Roles(UserRole.STAFF, UserRole.ADMIN)
    @ApiOperation({ summary: 'Check in a pet for boarding' })
    async checkIn(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() checkInDto: CheckInDto,
        @Request() req,
    ) {
        return this.boardingService.checkIn(id, checkInDto, req.user.id);
    }

    @Patch('bookings/:id/check-out')
    @UseGuards(RolesGuard)
    @Roles(UserRole.STAFF, UserRole.ADMIN)
    @ApiOperation({ summary: 'Check out a pet from boarding' })
    async checkOut(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: { notes?: string },
        @Request() req,
    ) {
        return this.boardingService.checkOut(id, body.notes, req.user.id);
    }

    @Post('bookings/:id/activities')
    @UseGuards(RolesGuard)
    @Roles(UserRole.STAFF, UserRole.ADMIN)
    @ApiOperation({ summary: 'Add activity for a boarded pet' })
    async addActivity(
        @Param('id', ParseUUIDPipe) bookingId: string,
        @Body() createActivityDto: CreateActivityDto,
        @Request() req,
    ) {
        return this.activityService.createActivity(bookingId, createActivityDto, req.user.id);
    }

    @Get('bookings/:id/activities')
    @ApiOperation({ summary: 'Get activities for a booking' })
    async getActivities(@Param('id', ParseUUIDPipe) bookingId: string, @Request() req) {
        return this.activityService.getActivitiesByBooking(bookingId, req.user.id);
    }

    @Post('bookings/:id/photos')
    @UseGuards(RolesGuard)
    @Roles(UserRole.STAFF, UserRole.ADMIN)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload photo for a boarded pet' })
    async uploadPhoto(
        @Param('id', ParseUUIDPipe) bookingId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: { caption?: string; type?: string },
        @Request() req,
    ) {
        return this.boardingService.uploadPhoto(bookingId, file, body, req.user.id);
    }

    @Get('bookings/:id/photos')
    @ApiOperation({ summary: 'Get photos for a booking' })
    async getPhotos(@Param('id', ParseUUIDPipe) bookingId: string, @Request() req) {
        return this.boardingService.getPhotosByBooking(bookingId, req.user.id);
    }

    @Get('facilities')
    @ApiOperation({ summary: 'Get all boarding facilities' })
    async getFacilities() {
        return this.boardingService.getFacilities();
    }

    @Get('facilities/:id/packages')
    @ApiOperation({ summary: 'Get pricing packages for a facility' })
    async getPackages(@Param('id', ParseUUIDPipe) facilityId: string) {
        return this.boardingService.getPackagesByFacility(facilityId);
    }

    @Get('facilities/:id/availability')
    @ApiOperation({ summary: 'Check facility availability' })
    async checkAvailability(
        @Param('id', ParseUUIDPipe) facilityId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.boardingService.checkAvailability(facilityId, startDate, endDate);
    }

    @Delete('bookings/:id')
    @ApiOperation({ summary: 'Cancel a booking' })
    async cancelBooking(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
        return this.boardingService.cancelBooking(id, req.user.id);
    }

    // Staff/Admin endpoints
    @Get('admin/bookings')
    @UseGuards(RolesGuard)
    @Roles(UserRole.STAFF, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all bookings (staff/admin)' })
    async getAllBookings(
        @Query('facilityId') facilityId?: string,
        @Query('status') status?: string,
        @Query('date') date?: string,
    ) {
        return this.boardingService.getAllBookings({ facilityId, status, date });
    }

    @Get('admin/dashboard')
    @UseGuards(RolesGuard)
    @Roles(UserRole.STAFF, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get boarding dashboard data' })
    async getDashboard(@Query('facilityId') facilityId?: string) {
        return this.boardingService.getDashboardData(facilityId);
    }
  }