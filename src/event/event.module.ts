import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { PrismaModule } from 'src/db/prisma.module';
import { ImageService } from './image/image.service';
import { AwsModule } from 'src/aws/aws.module';
import { AwsService } from 'src/aws/aws.service';
import { InvitationService } from './invitation/invitation.service';

@Module({
  imports: [PrismaModule, AwsModule],
  controllers: [EventController],
  providers: [EventService, ImageService, AwsService, InvitationService],
  exports: [ImageService],
})
export class EventModule {}
