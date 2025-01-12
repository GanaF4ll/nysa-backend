import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { PrismaService } from 'src/db/prisma.service';
import * as argon2 from 'argon2';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { CreateGoogleUserDto } from './dto/create-google-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, firstname, lastname } = createUserDto;
    const formattedFirst =
      firstname.charAt(0).toUpperCase() + firstname.slice(1);
    const formattedLast = lastname.charAt(0).toUpperCase() + lastname.slice(1);
    const formattedEmail = email.toLowerCase();
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: formattedEmail },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await argon2.hash(password);

    const newUser = await this.prismaService.user.create({
      data: {
        email: formattedEmail,
        password: hashedPassword,
        firstname: formattedFirst,
        lastname: formattedLast,
        birthdate: new Date(createUserDto.birthdate),
        sex: createUserDto.sex,
        phone: createUserDto.phone,
        image_url: createUserDto.image_url,
        bio: createUserDto.bio,
      },
    });

    return newUser;
  }

  async createOrganisation(createOrganisationDto: CreateOrganisationDto) {
    const { email, password } = createOrganisationDto;
    const formattedEmail = email.toLowerCase();
    const existingOrganisation = await this.prismaService.user.findUnique({
      where: { email: formattedEmail },
    });
    if (existingOrganisation) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await argon2.hash(password);
    const newOrganisation = await this.prismaService.user.create({
      data: {
        email: formattedEmail,
        password: hashedPassword,
        name: createOrganisationDto.name,
        phone: createOrganisationDto.phone,
        image_url: createOrganisationDto.image_url,
        bio: createOrganisationDto.bio,
        type: 'ORGANISATION',
      },
    });
    return newOrganisation;
  }

  async createGoogleUser(createGoogleUserDto: CreateGoogleUserDto) {
    const { email, firstname, lastname, image_url, provider } =
      createGoogleUserDto;

    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException(
          `User already exists: ${JSON.stringify(existingUser)}`,
        );
        return existingUser;
      }

      const newUser = await this.prismaService.user.create({
        data: {
          email,
          firstname,
          lastname,
          image_url,
          provider,
        },
      });

      return newUser;
    } catch (error) {
      throw new BadRequestException(
        `Error creating Google user: ${error.message}`,
      );
    }
  }

  async findAll() {
    const users = await this.prismaService.user.findMany({
      select: {
        id: true,
        type: true,
        email: true,
        firstname: true,
        lastname: true,
        name: true,
        birthdate: true,
        sex: true,
        phone: true,
        image_url: true,
        bio: true,
        provider: true,
        active: true,
        updated_at: true,
        created_at: true,
      },
    });

    if (!users) throw new NotFoundException('No users found');

    return users;
  }

  async findOne(id: string) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        email: true,
        firstname: true,
        lastname: true,
        name: true,
        birthdate: true,
        sex: true,
        phone: true,
        bio: true,
        provider: true,
        active: true,
      },
    });

    if (!existingUser) throw new NotFoundException('User not found');

    return existingUser;
  }

  async findOneByEmail(email: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (user) {
      } else {
      }

      return user;
    } catch (error) {
      throw new NotFoundException(
        `Error finding user by email: ${error.message}`,
      );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.findOne(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: {
        ...updateUserDto,
      },
    });

    if (updatedUser) {
      ('User updated successfully');
    } else {
      throw new BadRequestException('User not updated');
    }
  }

  async deactivate(id: string) {
    const existingUser = await this.findOne(id);

    await this.prismaService.user.update({
      where: { id },
      data: {
        active: false,
      },
    });

    return `User ${id} has been deactivated`;
  }

  async remove(id: string) {
    const existingUser = await this.findOne(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.user.delete({
      where: { id },
    });

    return `User ${id} has been deleted`;
  }
}
