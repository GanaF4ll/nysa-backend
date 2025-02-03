import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { PrismaModule } from 'src/db/prisma.module';
import { PrismaService } from 'src/db/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [InvitationController],
  providers: [InvitationService, PrismaService],
})
export class InvitationModule {}
