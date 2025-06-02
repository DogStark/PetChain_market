import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { PhotosService } from './photo.service';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

@ApiTags('photos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload pet photo' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadPhotoDto,
    @Req() req,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.photosService.upload(
      file,
      uploadDto.petId,
      req.user.id,
      uploadDto.caption,
    );
  }

  @Get('pet/:petId')
  @ApiOperation({ summary: 'Get photos for a pet' })
  findByPet(@Param('petId') petId: string, @Req() req) {
    return this.photosService.findByPet(petId, req.user.id);
  }

  @Patch(':photoId/profile/:petId')
  @ApiOperation({ summary: 'Set photo as profile photo' })
  setProfilePhoto(
    @Param('photoId') photoId: string,
    @Param('petId') petId: string,
    @Req() req,
  ) {
    return this.photosService.setProfilePhoto(photoId, petId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete photo' })
  remove(@Param('id') id: string, @Req() req) {
    return this.photosService.delete(id, req.user.id);
  }
}
