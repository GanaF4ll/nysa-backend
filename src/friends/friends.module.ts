import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { PrismaModule } from 'src/db/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
