import { SetMetadata } from '@nestjs/common';

export const API_VERSION = 'api_version';
export const ApiVersion = (version: number) => SetMetadata(API_VERSION, version); 