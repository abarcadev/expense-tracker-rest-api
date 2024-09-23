import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, Length, Min } from 'class-validator';

export class FindAllUsersDto {
  @Length(1, 20)
  @IsString()
  @IsOptional()
  fullName: string;

  @Length(1, 20)
  @IsString()
  @IsOptional()
  username: string;

  @Length(1, 20)
  @IsOptional()
  email: string;

  @Type(() => Date)
  // @IsDateString()
  @IsDate()
  @IsOptional()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate: Date;

  @Type(() => Number)
  @Min(0)
  @IsOptional()
  skip: number;

  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit: number;
}
