import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/db/prisma.module';
import { ImageService } from 'src/events/image/image.service';
import { AwsModule } from 'src/aws/aws.module';
import { AwsService } from 'src/aws/aws.service';

@Module({
  imports: [PrismaModule, AwsModule],
  controllers: [UsersController],
  providers: [UsersService, ImageService, AwsService],
})
export class UsersModule {}
