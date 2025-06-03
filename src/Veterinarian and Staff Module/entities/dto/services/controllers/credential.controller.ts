import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { CredentialService } from '../services/credential.service';
import { CreateCredentialDto } from '../dto/create-credential.dto';

@Controller('credentials')
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post()
  create(@Body() createCredentialDto: CreateCredentialDto) {
    return this.credentialService.create(createCredentialDto);
  }

  @Get('veterinarian/:veterinarianId')
  findByVeterinarian(@Param('veterinarianId', ParseIntPipe) veterinarianId: number) {
    return this.credentialService.findByVeterinarian(veterinarianId);
  }

  @Get('expiring')
  findExpiringCredentials(@Query('days') days?: string) {
    const daysAhead = days ? parseInt(days, 10) : 30;
    return this.credentialService.findExpiringCredentials(daysAhead);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateData: Partial<CreateCredentialDto>) {
    return this.credentialService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.credentialService.remove(id);
  }
}
