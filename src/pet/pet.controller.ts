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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { SearchPetsDto } from './dto/search-pets.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';


@ApiTags('pets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pet' })
  create(@Body() createPetDto: CreatePetDto, @Req() req) {
    return this.petsService.create(createPetDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pets with search and filtering' })
  findAll(@Query() searchDto: SearchPetsDto, @Req() req) {
    return this.petsService.findAll(searchDto, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pet by ID' })
  findOne(@Param('id') id: string, @Req() req) {
    return this.petsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pet' })
  update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto, @Req() req) {
    return this.petsService.update(id, updatePetDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pet' })
  remove(@Param('id') id: string, @Req() req) {
    return this.petsService.remove(id, req.user.id);
  }

  @Post(':id/family-members/:memberId')
  @ApiOperation({ summary: 'Add family member to pet' })
  addFamilyMember(
    @Param('id') petId: string,
    @Param('memberId') memberId: string,
    @Req() req,
  ) {
    return this.petsService.addFamilyMember(petId, memberId, req.user.id);
  }

  @Delete(':id/family-members/:memberId')
  @ApiOperation({ summary: 'Remove family member from pet' })
  removeFamilyMember(
    @Param('id') petId: string,
    @Param('memberId') memberId: string,
    @Req() req,
  ) {
    return this.petsService.removeFamilyMember(petId, memberId, req.user.id);
  }
}