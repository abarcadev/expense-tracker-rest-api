import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ERROR_MESSAGES } from '../common/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const userData = await this.usersService.findOneByEmail(email);

    if (!userData) {
      throw new UnauthorizedException(ERROR_MESSAGES.LOGIN_FAILED);
    }

    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
      throw new UnauthorizedException(ERROR_MESSAGES.LOGIN_FAILED);
    }

    const user = userData.toObject();
    delete user.password;

    return {
      ...user,
      token: this.jwtService.sign(user),
    };
  }
}
