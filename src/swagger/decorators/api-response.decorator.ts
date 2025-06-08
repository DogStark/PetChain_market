import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export const ApiStandardResponses = () => applyDecorators(
  ApiResponse({ status: 400, description: 'Bad Request' }),
  ApiResponse({ status: 401, description: 'Unauthorized' }),
  ApiResponse({ status: 403, description: 'Forbidden' }),
  ApiResponse({ status: 500, description: 'Internal Server Error' }),
);