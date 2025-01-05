import { User_type } from '@prisma/client';
import { IsEnum, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { CreateOrganisationDto } from 'src/user/dto/create-organisation.dto';

export class RegisterUserDto {
  @ApiProperty({
    enum: User_type,
    description: "Le type de l'utilisateur",
    example: User_type.USER,
  })
  type!: User_type;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(CreateUserDto) },
      { $ref: getSchemaPath(CreateOrganisationDto) },
    ],
    description: "Les données de l'utilisateur",
  })
  @ValidateNested()
  @Type((opts) => {
    return opts.object.type === User_type.USER
      ? CreateUserDto
      : CreateOrganisationDto;
  })
  data!: CreateUserDto | CreateOrganisationDto;
}
