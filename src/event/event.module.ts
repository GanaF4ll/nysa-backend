import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { PrismaModule } from 'src/db/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { ImageService } from './image/image.service';
import { MemberService } from './member/member.service';
import { AwsModule } from 'src/aws/aws.module';
import { AwsService } from 'src/aws/aws.service';

@Module({
  imports: [PrismaModule, AwsModule],
  controllers: [EventController],
  providers: [EventService, ImageService, MemberService, AwsService],
})
export class EventModule {}
