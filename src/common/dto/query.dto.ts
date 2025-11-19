import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDto {
  @IsOptional()
  @IsString()
  search?: string; // For the "Filter..." box

  // --- Pagination ---
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // Transform query string "1" -> number 1
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number = 10; // Default to 10 items per page
}
