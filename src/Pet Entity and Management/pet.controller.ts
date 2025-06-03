import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetResponseDto } from './dto/pet-response.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('pets')
@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pet' })
  @ApiResponse({ status: 201, description: 'Pet created successfully', type: PetResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Owner not found' })
  async create(@Body() createPetDto: CreatePetDto): Promise<PetResponseDto> {
    return this.petService.create(createPetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pets or filter by owner/species' })
  @ApiResponse({ status: 200, description: 'Pets retrieved successfully', type: [PetResponseDto] })
  @ApiQuery({ name: 'ownerId', required: false, type: Number })
  @ApiQuery({ name: 'species', required: false, type: String })
  async findAll(
    @Query('ownerId') ownerId?: string,
    @Query('species') species?: string,
  ): Promise<PetResponseDto[]> {
    if (ownerId) {
      return this.petService.findByOwner(parseInt(ownerId, 10));
    }
    
    if (species) {
      return this.petService.findBySpecies(species);
    }

    return this.petService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pet by ID' })
  @ApiResponse({ status: 200, description: 'Pet retrieved successfully', type: PetResponseDto })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PetResponseDto> {
    return this.petService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pet' })
  @ApiResponse({ status: 200, description: 'Pet updated successfully', type: PetResponseDto })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiParam({ name: 'id', type: Number })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePetDto: UpdatePetDto,
  ): Promise<PetResponseDto> {
    return this.petService.update(id, updatePetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pet' })
  @ApiResponse({ status: 200, description: 'Pet deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.petService.remove(id);
    return { message: 'Pet deleted successfully' };
  }

  @Post(':id/photo')
  @ApiOperation({ summary: 'Upload a pet photo' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Photo uploaded successfully', type: PetResponseDto })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @ApiParam({ name: 'id', type: Number })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/pets',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `pet-${req.params.id}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ): Promise<PetResponseDto> {
    const photoUrl = `/uploads/pets/${file.filename}`;
    return this.petService.uploadPhoto(id, photoUrl);
  }

  @Get(':id/photo')
  @ApiOperation({ summary: 'Get pet photo URL' })
  @ApiResponse({ status: 200, description: 'Photo URL retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiParam({ name: 'id', type: Number })
  async getPhoto(@Param('id', ParseIntPipe) id: number): Promise<{ photoUrl: string | null }> {
    const pet = await this.petService.findOne(id);
    return { photoUrl: pet.photoUrl || null };
  }
}
