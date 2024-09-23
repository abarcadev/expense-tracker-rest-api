import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, Length, Min } from 'class-validator';

export class FindAllCategoriesDto {
  @Length(1, 20)
  @IsString()
  @IsOptional()
  name: string;

  @Length(1, 20)
  @IsString()
  @IsOptional()
  description: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate: Date;

  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page: number;

  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit: number;
}
