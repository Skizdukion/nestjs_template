import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PaginationOptions {
  @ApiProperty({
    minimum: 0,
    maximum: 10000,
    title: 'Page',
    exclusiveMaximum: true,
    exclusiveMinimum: true,
    format: 'int32',
    default: 1,
  })
  @Transform(({ value }) => (value ?? 1 < 1 ? 1 : value))
  @IsOptional()
  page: number;

  @ApiProperty({
    minimum: 1,
    maximum: 100,
    title: 'Limit',
    exclusiveMaximum: true,
    exclusiveMinimum: true,
    format: 'int32',
    default: 10,
  })
  @Transform(({ value }) => (value ?? 10 < 0 ? 10 : value))
  @IsOptional()
  limit: number;
}
