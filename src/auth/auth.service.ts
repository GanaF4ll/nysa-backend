import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/db/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { CreateOrganisationDto } from 'src/user/dto/create-organisation.dto';
import { RegisterUserDto } from './dto/register.dto';
import { CreateGoogleUserDto } from 'src/user/dto/create-google-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaservice: PrismaService,
    private readonly jwt: JwtService,
    private readonly userService: UserService,
  ) {}

  async register(registerDto: RegisterUserDto) {
    let newUser;
    if (registerDto.type === 'USER') {
      newUser = await this.userService.createUser(
        registerDto.data as CreateUserDto,
      );
    } else if (registerDto.type === 'ORGANISATION') {
      newUser = await this.userService.createOrganisation(
        registerDto.data as CreateOrganisationDto,
      );
    } else {
      throw new BadRequestException('Invalid user type');
    }
    const payload = { email: newUser.email, id: newUser.id };

    return {
      access_token: this.jwt.sign(payload),
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    const payload = { email: user.email, id: user.id };
    return {
      access_token: this.jwt.sign(payload),
    };
  }

  async validateGoogleUser(googleUser: CreateGoogleUserDto) {
    try {
      let user = await this.userService.findOneByEmail(googleUser.email);

      if (user) {
        return user;
      }

      user = await this.userService.createGoogleUser(googleUser);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async googleLogin(id: string) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const payload = { email: user.email, id: user.id };
    const token = this.jwt.sign(payload);
    return { access_token: token };
  }
}
