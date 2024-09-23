import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @Length(2, 20)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Length(2, 60)
  @IsString()
  @IsNotEmpty()
  description: string;
}
