import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ComparisonService } from './comparison.service';
import { ComparisonDto } from './dto/comparison.dto';

@ApiTags('comparison')
@Controller('comparison')
export class ComparisonController {
  constructor(private readonly comparisonService: ComparisonService) {}

  @Post()
  @ApiOperation({ summary: 'Compare multiple products' })
  @ApiResponse({ status: 200, description: 'Products compared successfully' })
  compareProducts(@Body() comparisonDto: ComparisonDto) {
    return this.comparisonService.compareProducts(comparisonDto);
  }
}
