import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { PrismaModule } from 'src/db/prisma.module';
import { PrismaService } from 'src/db/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [InvitationsController],
  providers: [InvitationsService, PrismaService],
})
export class InvitationsModule {}
