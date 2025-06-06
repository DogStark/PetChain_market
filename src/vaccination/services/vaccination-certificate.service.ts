import { Injectable } from '@nestjs/common';
import { VaccinationRecord } from '../entities/vaccination-record.entity';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class VaccinationCertificateService {
  async generateVaccinationCertificate(
    vaccinationRecord: VaccinationRecord,
    petDetails: any,
    ownerDetails: any,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        doc.fontSize(20).text('VACCINATION CERTIFICATE', 50, 50, { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text('Pet Information', 50, 120);
        doc.fontSize(12)
          .text(`Name: ${petDetails.name}`, 50, 140)
          .text(`Species: ${petDetails.species}`, 50, 155)
          .text(`Breed: ${petDetails.breed}`, 50, 170)
          .text(`Date of Birth: ${petDetails.dateOfBirth.toLocaleDateString()}`, 50, 185);

        doc.fontSize(14).text('Owner Information', 50, 220);
        doc.fontSize(12)
          .text(`Name: ${ownerDetails.name}`, 50, 240)
          .text(`Email: ${ownerDetails.email}`, 50, 255)
          .text(`Phone: ${ownerDetails.phone}`, 50, 270);

        doc.fontSize(14).text('Vaccination Details', 50, 320);
        doc.fontSize(12)
          .text(`Vaccine Name: ${vaccinationRecord.vaccineName}`, 50, 340)
          .text(`Vaccine Type: ${vaccinationRecord.vaccineType}`, 50, 355)
          .text(`Manufacturer: ${vaccinationRecord.manufacturer}`, 50, 370)
          .text(`Batch Number: ${vaccinationRecord.batchNumber}`, 50, 385)
          .text(`Date Administered: ${vaccinationRecord.administeredDate.toLocaleDateString()}`, 50, 400)
          .text(`Next Due Date: ${vaccinationRecord.nextDueDate?.toLocaleDateString() || 'N/A'}`, 50, 415);

        doc.fontSize(14).text('Veterinarian Information', 50, 460);
        doc.fontSize(12)
          .text(`Veterinarian: ${vaccinationRecord.veterinarianName}`, 50, 480)
          .text(`Clinic: ${vaccinationRecord.clinicName}`, 50, 495);

        doc.fontSize(10)
          .text(`Certificate ID: ${vaccinationRecord.id}`, 50, 550)
          .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 565);

        doc.fontSize(8)
          .text('This certificate is valid only with official veterinary seal and signature.', 50, 700, {
            align: 'center',
          });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateVaccinationHistory(petId: string, vaccinationRecords: VaccinationRecord[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        doc.fontSize(20).text('VACCINATION HISTORY', 50, 50, { align: 'center' });
        doc.moveDown();

        let yPosition = 120;

        vaccinationRecords.forEach((record, index) => {
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }

          doc.fontSize(12)
            .text(`${index + 1}. ${record.vaccineName}`, 50, yPosition)
            .text(`Date: ${record.administeredDate.toLocaleDateString()}`, 200, yPosition)
            .text(`Next Due: ${record.nextDueDate?.toLocaleDateString() || 'N/A'}`, 350, yPosition)
            .text(`Veterinarian: ${record.veterinarianName}`, 50, yPosition + 15)
            .text(`Clinic: ${record.clinicName}`, 200, yPosition + 15);

          yPosition += 40;
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}