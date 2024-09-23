import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Length(10, 20)
  @IsString()
  @IsNotEmpty()
  password: string;
}
