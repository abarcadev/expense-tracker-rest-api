import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class FindAllExpensesDto {
  @Length(1, 20)
  @IsString()
  @IsOptional()
  category: string;

  @Length(1, 20)
  @IsString()
  @IsOptional()
  username: string;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  groupByCategory: boolean;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  groupByUsername: boolean;

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
