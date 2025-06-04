import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionRefill } from './entities/prescription-refill.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { CreatePrescriptionRefillDto } from './dto/create-prescription-refill.dto';
import { ProcessPrescriptionRefillDto } from './dto/process-prescription-refill.dto';
import { PetService } from '@/pet/pet.service';
import { PrescriptionStatus } from './enums/prescription-status.enum';
import { RefillStatus } from './enums/refill-status.enum';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    @InjectRepository(PrescriptionRefill)
    private prescriptionRefillRepository: Repository<PrescriptionRefill>,
    private petService: PetService,
  ) {}

  async create(
    createDto: CreatePrescriptionDto,
    userId: string,
  ): Promise<Prescription> {
    // Verify user has access to the pet
    await this.petService.findOne(createDto.petId, userId);

    const prescription = this.prescriptionRepository.create({
      ...createDto,
      startDate: new Date(createDto.startDate),
      endDate: createDto.endDate ? new Date(createDto.endDate) : null,
      veterinarianId: userId,
      status: createDto.status || PrescriptionStatus.PENDING,
    });

    return this.prescriptionRepository.save(prescription);
  }

  async findAll(userId: string): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      where: { veterinarianId: userId },
      order: { createdAt: 'DESC' },
      relations: ['pet', 'veterinarian'],
    });
  }

  async findByPet(petId: string, userId: string): Promise<Prescription[]> {
    // Verify user has access to the pet
    await this.petService.findOne(petId, userId);

    return this.prescriptionRepository.find({
      where: { petId },
      order: { createdAt: 'DESC' },
      relations: ['veterinarian', 'fulfilledBy'],
    });
  }

  async findOne(id: string, userId: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['pet', 'veterinarian', 'fulfilledBy', 'refills', 'refills.requestedBy', 'refills.processedBy'],
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Verify user has access to the pet
    await this.petService.findOne(prescription.petId, userId);

    return prescription;
  }

  async update(
    id: string,
    updateDto: UpdatePrescriptionDto,
    userId: string,
  ): Promise<Prescription> {
    const prescription = await this.findOne(id, userId);

    // Only the veterinarian who created the prescription can update it
    if (prescription.veterinarianId !== userId) {
      throw new ForbiddenException('You are not authorized to update this prescription');
    }

    // Convert date strings to Date objects if provided
    if (updateDto.startDate) {
      updateDto.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      updateDto.endDate = new Date(updateDto.endDate);
    }

    Object.assign(prescription, updateDto);
    return this.prescriptionRepository.save(prescription);
  }

  async remove(id: string, userId: string): Promise<void> {
    const prescription = await this.findOne(id, userId);
    
    // Only the veterinarian who created the prescription can delete it
    if (prescription.veterinarianId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this prescription');
    }
    
    await this.prescriptionRepository.remove(prescription);
  }

  async fulfill(id: string, userId: string): Promise<Prescription> {
    const prescription = await this.findOne(id, userId);
    
    if (prescription.status === PrescriptionStatus.FULFILLED) {
      throw new BadRequestException('Prescription has already been fulfilled');
    }
    
    prescription.status = PrescriptionStatus.ACTIVE;
    prescription.fulfilledById = userId;
    prescription.fulfilledAt = new Date();
    
    return this.prescriptionRepository.save(prescription);
  }

  async validatePrescription(id: string): Promise<boolean> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
    });

    if (!prescription) {
      return false;
    }

    // Check if prescription is expired
    const currentDate = new Date();
    const endDate = prescription.endDate || 
      new Date(prescription.startDate.getTime() + prescription.duration * 24 * 60 * 60 * 1000);
    
    if (currentDate > endDate) {
      prescription.status = PrescriptionStatus.EXPIRED;
      await this.prescriptionRepository.save(prescription);
      return false;
    }

    return true;
  }

  // Prescription refill management
  async requestRefill(
    createDto: CreatePrescriptionRefillDto,
    userId: string,
  ): Promise<PrescriptionRefill> {
    const prescription = await this.findOne(createDto.prescriptionId, userId);
    
    // Check if prescription is valid
    const isValid = await this.validatePrescription(prescription.id);
    if (!isValid) {
      throw new BadRequestException('Prescription is expired or invalid');
    }
    
    // Check if refills are available
    if (prescription.refillsUsed >= prescription.refillsAllowed) {
      throw new BadRequestException('No refills remaining for this prescription');
    }
    
    const refill = this.prescriptionRefillRepository.create({
      prescriptionId: prescription.id,
      notes: createDto.notes,
      requestedById: userId,
      status: RefillStatus.REQUESTED,
    });
    
    return this.prescriptionRefillRepository.save(refill);
  }

  async processRefill(
    refillId: string,
    processDto: ProcessPrescriptionRefillDto,
    userId: string,
  ): Promise<PrescriptionRefill> {
    const refill = await this.prescriptionRefillRepository.findOne({
      where: { id: refillId },
      relations: ['prescription'],
    });
    
    if (!refill) {
      throw new NotFoundException('Prescription refill not found');
    }
    
    // Verify user has access to process this refill (should be a veterinarian)
    const prescription = await this.findOne(refill.prescriptionId, userId);
    
    refill.status = processDto.status;
    refill.notes = processDto.notes || refill.notes;
    refill.processedById = userId;
    refill.processedAt = new Date();
    
    // If approved, increment the refills used count
    if (processDto.status === RefillStatus.APPROVED || processDto.status === RefillStatus.FULFILLED) {
      prescription.refillsUsed += 1;
      await this.prescriptionRepository.save(prescription);
    }
    
    return this.prescriptionRefillRepository.save(refill);
  }

  async getRefillHistory(prescriptionId: string, userId: string): Promise<PrescriptionRefill[]> {
    // Verify user has access to the prescription
    await this.findOne(prescriptionId, userId);
    
    return this.prescriptionRefillRepository.find({
      where: { prescriptionId },
      order: { createdAt: 'DESC' },
      relations: ['requestedBy', 'processedBy'],
    });
  }
}
