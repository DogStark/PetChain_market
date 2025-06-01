import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BoardingFacility } from './entities/boarding-facility.entity';
import { PricingPackage } from './entities/pricing-package.entity';
import { Photo, PhotoType } from './entities/photo.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CheckInDto } from './dto/check-in.dto';
import { PricingService } from './pricing.service';

@Injectable()
export class BoardingService {
    constructor(
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>,
        @InjectRepository(BoardingFacility)
        private facilityRepository: Repository<BoardingFacility>,
        @InjectRepository(PricingPackage)
        private packageRepository: Repository<PricingPackage>,
        @InjectRepository(Photo)
        private photoRepository: Repository<Photo>,
        private pricingService: PricingService,
    ) { }

    async createBooking(createBookingDto: CreateBookingDto, ownerId: string) {
        const { facilityId, packageId, startDate, endDate } = createBookingDto;

        // Validate facility exists and is active
        const facility = await this.facilityRepository.findOne({
            where: { id: facilityId, isActive: true },
        });
        if (!facility) {
            throw new NotFoundException('Boarding facility not found');
        }

        // Validate package exists and belongs to facility
        const package_ = await this.packageRepository.findOne({
            where: { id: packageId, facilityId, isActive: true },
        });
        if (!package_) {
            throw new NotFoundException('Pricing package not found');
        }

        // Check availability
        const isAvailable = await this.checkAvailability(facilityId, startDate, endDate);
        if (!isAvailable.available) {
            throw new BadRequestException('Facility not available for selected dates');
        }

        // Calculate total price
        const totalPrice = await this.pricingService.calculatePrice(
            packageId,
            new Date(startDate),
            new Date(endDate),
        );

        const booking = this.bookingRepository.create({
            ...createBookingDto,
            ownerId,
            totalPrice,
            status: BookingStatus.PENDING,
        });

        const savedBooking = await this.bookingRepository.save(booking);

        // Update facility occupancy
        await this.updateFacilityOccupancy(facilityId);

        return this.bookingRepository.findOne({
            where: { id: savedBooking.id },
            relations: ['pet', 'owner', 'facility', 'package'],
        });
    }

    async getBookingsByOwner(ownerId: string, status?: string) {
        const where: any = { ownerId };
        if (status) {
            where.status = status;
        }

        return this.bookingRepository.find({
            where,
            relations: ['pet', 'facility', 'package'],
            order: { createdAt: 'DESC' },
        });
    }

    async getBookingById(id: string, userId: string) {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ['pet', 'owner', 'facility', 'package', 'activities', 'photos'],
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        // Check if user has access to this booking
        if (booking.ownerId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return booking;
    }

    async checkIn(id: string, checkInDto: CheckInDto, staffId: string) {
        const booking = await this.bookingRepository.findOne({
            where: { id, status: BookingStatus.CONFIRMED },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found or not confirmed');
        }

        // Update booking status and check-in time
        booking.status = BookingStatus.CHECKED_IN;
        booking.checkInTime = new Date();
        if (checkInDto.notes) {
            booking.notes = booking.notes
                ? `${booking.notes}\n\nCheck-in notes: ${checkInDto.notes}`
                : `Check-in notes: ${checkInDto.notes}`;
        }

        await this.bookingRepository.save(booking);

        // Save check-in photos if provided
        if (checkInDto.photos && checkInDto.photos.length > 0) {
            const photos = checkInDto.photos.map(photo =>
                this.photoRepository.create({
                    bookingId: id,
                    uploadedById: staffId,
                    url: photo.url,
                    filename: `checkin_${Date.now()}.jpg`,
                    type: PhotoType.DAILY_UPDATE,
                    caption: photo.caption || 'Check-in photo',
                })
            );
            await this.photoRepository.save(photos);
        }

        return this.getBookingById(id, booking.ownerId);
    }

    async checkOut(id: string, notes: string, staffId: string) {
        const booking = await this.bookingRepository.findOne({
            where: { id, status: BookingStatus.CHECKED_IN },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found or not checked in');
        }

        booking.status = BookingStatus.CHECKED_OUT;
        booking.checkOutTime = new Date();
        if (notes) {
            booking.notes = booking.notes
                ? `${booking.notes}\n\nCheck-out notes: ${notes}`
                : `Check-out notes: ${notes}`;
        }

        await this.bookingRepository.save(booking);

        // Update facility occupancy
        await this.updateFacilityOccupancy(booking.facilityId);

        return this.getBookingById(id, booking.ownerId);
    }

    async uploadPhoto(
        bookingId: string,
        file: Express.Multer.File,
        metadata: { caption?: string; type?: string },
        uploadedById: string,
    ) {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        // In a real implementation, you would upload the file to a cloud storage service
        // For now, we'll simulate with a placeholder URL
        const photoUrl = `https://storage.example.com/boarding-photos/${file.filename}`;

        const photo = this.photoRepository.create({
            bookingId,
            uploadedById,
            url: photoUrl,
            filename: file.filename,
            type: metadata.type as PhotoType || PhotoType.DAILY_UPDATE,
            caption: metadata.caption,
            metadata: {
                size: file.size,
                mimeType: file.mimetype,
            },
        });

        return this.photoRepository.save(photo);
    }

    async getPhotosByBooking(bookingId: string, userId: string) {
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        if (booking.ownerId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return this.photoRepository.find({
            where: { bookingId, isVisible: true },
            relations: ['uploadedBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async getFacilities() {
        return this.facilityRepository.find({
            where: { isActive: true },
            relations: ['packages'],
        });
    }

    async getPackagesByFacility(facilityId: string) {
        return this.packageRepository.find({
            where: { facilityId, isActive: true },
            order: { dailyRate: 'ASC' },
        });
    }

    async checkAvailability(facilityId: string, startDate: string, endDate: string) {
        const facility = await this.facilityRepository.findOne({
            where: { id: facilityId },
        });

        if (!facility) {
            throw new NotFoundException('Facility not found');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Count overlapping bookings
        const overlappingBookings = await this.bookingRepository.count({
            where: {
                facilityId,
                status: BookingStatus.CHECKED_IN,
                startDate: LessThanOrEqual(end),
                endDate: MoreThanOrEqual(start),
            },
        });

        const availableSpots = facility.capacity - overlappingBookings;

        return {
            available: availableSpots > 0,
            availableSpots,
            totalCapacity: facility.capacity,
        };
    }

    async cancelBooking(id: string, userId: string) {
        const booking = await this.bookingRepository.findOne({
            where: { id, ownerId: userId },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        if (booking.status === BookingStatus.CHECKED_IN) {
            throw new BadRequestException('Cannot cancel a booking that is already checked in');
        }

        booking.status = BookingStatus.CANCELLED;
        await this.bookingRepository.save(booking);

        // Update facility occupancy
        await this.updateFacilityOccupancy(booking.facilityId);

        return booking;
    }

    async getAllBookings(filters: { facilityId?: string; status?: string; date?: string }) {
        const where: any = {};

        if (filters.facilityId) {
            where.facilityId = filters.facilityId;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.date) {
            const date = new Date(filters.date);
            where.startDate = LessThanOrEqual(date);
            where.endDate = MoreThanOrEqual(date);
        }

        return this.bookingRepository.find({
            where,
            relations: ['pet', 'owner', 'facility', 'package'],
            order: { createdAt: 'DESC' },
        });
    }

    async getDashboardData(facilityId?: string) {
        const where: any = {};
        if (facilityId) {
            where.facilityId = facilityId;
        }

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const [
            totalBookings,
            activeBookings,
            todayCheckIns,
            todayCheckOuts,
            pendingBookings,
        ] = await Promise.all([
            this.bookingRepository.count({ where }),
            this.bookingRepository.count({
                where: { ...where, status: BookingStatus.CHECKED_IN }
            }),
            this.bookingRepository.count({
                where: {
                    ...where,
                    checkInTime: Between(startOfDay, endOfDay),
                },
            }),
            this.bookingRepository.count({
                where: {
                    ...where,
                    checkOutTime: Between(startOfDay, endOfDay),
                },
            }),
            this.bookingRepository.count({
                where: { ...where, status: BookingStatus.PENDING },
            }),
        ]);

        return {
            totalBookings,
            activeBookings,
            todayCheckIns,
            todayCheckOuts,
            pendingBookings,
        };
    }

    private async updateFacilityOccupancy(facilityId: string) {
        const currentOccupancy = await this.bookingRepository.count({
            where: {
                facilityId,
                status: BookingStatus.CHECKED_IN,
            },
        });

        await this.facilityRepository.update(facilityId, { currentOccupancy });
    }
  }