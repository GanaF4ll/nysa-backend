import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaModule } from 'src/db/prisma.module';
import { ImageService } from './image/image.service';
import { AwsModule } from 'src/aws/aws.module';
import { AwsService } from 'src/aws/aws.service';
import { InvitationService } from '../invitation/invitation.service';
import { EventsController } from './events.controller';

@Module({
  imports: [PrismaModule, AwsModule],
  controllers: [EventsController],
  providers: [EventsService, ImageService, AwsService, InvitationService],
  exports: [ImageService],
})
export class EventsModule {}
