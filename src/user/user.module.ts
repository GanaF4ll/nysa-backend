import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/db/prisma.module';
import { ImageService } from 'src/event/image/image.service';
import { AwsModule } from 'src/aws/aws.module';
import { AwsService } from 'src/aws/aws.service';

@Module({
  imports: [PrismaModule, AwsModule],
  controllers: [UserController],
  providers: [UserService, ImageService, AwsService],
})
export class UserModule {}
