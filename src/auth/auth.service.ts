import { CreateImageDto } from '../events/image/dto/create-image.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/db/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateOrganisationDto } from 'src/users/dto/create-organisation.dto';
import { RegisterUserDto } from './dto/register.dto';
import { CreateGoogleUserDto } from 'src/users/dto/create-google-user.dto';
import { VerifyMailDto } from './dto/verify-mail.dto';
import { Provider, User_type } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { log } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwt: JwtService,
    private readonly userService: UsersService,
  ) {}

  async register(
    registerDto: RegisterUserDto,
    createImageDto?: CreateImageDto,
  ) {
    const { device_id } = registerDto;
    let newUser;

    if (registerDto.type === User_type.USER) {
      // Conversion explicite vers CreateUserDto
      const userDto: CreateUserDto = {
        email: registerDto.email!,
        password: registerDto.password!,
        firstname: registerDto.firstname!,
        lastname: registerDto.lastname!,
        birthdate: registerDto.birthdate!,
        bio: registerDto.bio,
        phone: registerDto.phone,
        sex: registerDto.sex,
      };
      if (!createImageDto) {
        newUser = await this.userService.createUser(userDto);
      } else {
        newUser = await this.userService.createUser(userDto, createImageDto);
      }
    } else if (registerDto.type === User_type.ORGANISATION) {
      const organisationDto: CreateOrganisationDto = {
        email: registerDto.email!,
        password: registerDto.password!,
        name: registerDto.name!,
        phone: registerDto.phone,
        bio: registerDto.bio,
      };

      if (!createImageDto) {
        newUser = await this.userService.createOrganisation(organisationDto);
      }
      newUser = await this.userService.createOrganisation(
        organisationDto,
        createImageDto,
      );
    } else {
      throw new BadRequestException('Invalid user type');
    }

    let payload: { id: string; device_id?: typeof device_id } = {
      id: newUser.id,
    };
    if (device_id) {
      payload.device_id = device_id;
    }
    const access_token = this.jwt.sign(payload);

    await this.prismaService.user_tokens.create({
      data: {
        user_id: newUser.id,
        device_id: device_id,
        token: access_token,
      },
    });

    return {
      access_token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, device_id } = loginDto;
    const formattedEmail = email.toLowerCase();

    const user = await this.userService.findOneByEmail(formattedEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = { id: user.id, ...(device_id && { device_id }) };
    const access_token = this.jwt.sign(payload);

    const existingTokens = await this.prismaService.user_tokens.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'asc' },
    });

    const tokenWithDeviceId = existingTokens.find(
      (token) => token.device_id !== null,
    );
    const tokensWithoutDeviceId = existingTokens.filter(
      (token) => !token.device_id,
    );

    // Gestion des tokens avec transaction pour garantir l'atomicité
    await this.prismaService.$transaction(async (prisma) => {
      if (device_id) {
        if (tokenWithDeviceId) {
          // Mise à jour du token existant avec device_id
          await prisma.user_tokens.update({
            where: { id: tokenWithDeviceId.id },
            data: { token: access_token },
          });
        } else {
          // Création d'un nouveau token avec device_id
          await prisma.user_tokens.create({
            data: {
              user_id: user.id,
              device_id,
              token: access_token,
            },
          });
        }
      } else {
        // Gestion du token sans device_id
        if (tokensWithoutDeviceId.length >= 1) {
          //? on supprime le token le plus ancien sans device_id
          await prisma.user_tokens.delete({
            where: { id: tokensWithoutDeviceId[0].id },
          });
        }

        // Création du nouveau token sans device_id
        await prisma.user_tokens.create({
          data: {
            user_id: user.id,
            token: access_token,
          },
        });
      }
    });

    return { access_token };
  }

  async verifyEmail(emailDto: VerifyMailDto) {
    const { email } = emailDto;
    const formattedEmail = email.toLowerCase();
    const user = await this.userService.findOneByEmail(formattedEmail);
    if (!user) {
      return {
        data: { isAvailable: true },
        message: `Email is available to use`,
      };
    }

    return {
      data: { isAvailable: false },
      message: `Email is already used`,
    };
  }

  async validateGoogleUser(googleUser: CreateGoogleUserDto) {
    try {
      let user = await this.prismaService.users.findUnique({
        where: { email: googleUser.email },
      });

      if (!user) {
        user = await this.userService.createGoogleUser(googleUser);
      }

      const payload = { id: user.id };

      if (user.provider !== Provider.GOOGLE) {
        throw new BadRequestException('User already exists');
      }

      return { access_token: this.jwt.sign(payload) };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async googleLogin(id: string) {
    const user = await this.prismaService.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const payload = { id: user.id };
    const token = this.jwt.sign(payload);
    return { access_token: token };
  }

  async verifyToken(id: string) {
    const user = await this.prismaService.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.active !== true) {
      throw new UnauthorizedException('User is not active');
    }
    return { message: true };
  }
}
