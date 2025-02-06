import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './db/prisma.module';
import { ChatModule } from './chat/chat.module';
import { ConversationModule } from './conversation/conversation.module';
import { EventModule } from './event/event.module';
import { AwsModule } from './aws/aws.module';
import { MemberModule } from './member/member.module';
import { InvitationModule } from './invitation/invitation.module';
import { FriendsModule } from './friends/friends.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    ChatModule,
    ConversationModule,
    EventModule,
    AwsModule,
    MemberModule,
    InvitationModule,
    FriendsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
