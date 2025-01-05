import {
  ConflictException,
  Injectable,
  Logger,
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
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await argon2.hash(password);

    const newUser = await this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstname: createUserDto.firstname,
        lastname: createUserDto.lastname,
        birthdate: new Date(createUserDto.birthdate),
        sex: createUserDto.sex,
        phone: createUserDto.phone,
        image_url: createUserDto.image_url,
        bio: createUserDto.bio,
        city: createUserDto.city,
      },
    });

    return newUser;
  }

  async createOrganisation(createOrganisationDto: CreateOrganisationDto) {
    const { email, password } = createOrganisationDto;
    const existingOrganisation = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (existingOrganisation) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await argon2.hash(password);
    const newOrganisation = await this.prismaService.user.create({
      data: {
        // Ajout de 'data'
        email: createOrganisationDto.email,
        password: hashedPassword,
        name: createOrganisationDto.name,
        phone: createOrganisationDto.phone,
        image_url: createOrganisationDto.image_url,
        bio: createOrganisationDto.bio,
        city: createOrganisationDto.city,
        type: 'ORGANISATION', // Vous voudrez probablement définir le type aussi
      },
    });
    return newOrganisation;
  }

  async createGoogleUser(createGoogleUserDto: CreateGoogleUserDto) {
    const { email, firstname, lastname, image_url } = createGoogleUserDto;
    this.logger.log(`Attempting to create Google user with email: ${email}`);

    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        this.logger.log(`User already exists: ${JSON.stringify(existingUser)}`);
        return existingUser; // Retourner l'utilisateur existant au lieu de throw une erreur
      }

      this.logger.log('Creating new user...');
      const newUser = await this.prismaService.user.create({
        data: {
          email,
          firstname,
          lastname,
          image_url,
        },
      });

      this.logger.log(`User created successfully: ${JSON.stringify(newUser)}`);
      return newUser;
    } catch (error) {
      this.logger.error(`Error creating Google user: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    const users = await this.prismaService.user.findMany();

    if (!users) throw new NotFoundException('No users found');

    return users;
  }

  async findOne(id: string) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!existingUser) throw new NotFoundException('User not found');

    return existingUser;
  }

  async findOneByEmail(email: string) {
    this.logger.log(`Searching for user with email: ${email}`);

    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (user) {
        this.logger.log(`Found user: ${JSON.stringify(user)}`);
      } else {
        this.logger.log(`No user found with email: ${email}`);
      }

      return user;
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`);
      throw error;
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

    return updatedUser;
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
