import { User_type } from '@prisma/client';
import { IsEnum, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { CreateOrganisationDto } from 'src/user/dto/create-organisation.dto';

export class RegisterUserDto {
  @IsEnum(User_type, { message: 'type must be either USER or ORGANISATION' })
  @ApiProperty({
    enum: User_type,
    description: "Le type de l'utilisateur",
    example: ['USER', 'ORGANISATION'],
  })
  type!: User_type;

  @IsObject()
  @ValidateNested()
  @Type((opts) => {
    return opts.object.type === 'USER' ? CreateUserDto : CreateOrganisationDto;
  })
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(CreateUserDto) },
      { $ref: getSchemaPath(CreateOrganisationDto) },
    ],
    description: "Les données de l'utilisateur",
  })
  data!: CreateUserDto | CreateOrganisationDto;
}
