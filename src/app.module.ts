import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './db/prisma.module';
import { ChatModule } from './chat/chat.module';
import { ConversationsModule } from './conversations/conversations.module';
import { AwsModule } from './aws/aws.module';
import { MembersModule } from './members/members.module';
import { InvitationsModule } from './invitations/invitations.module';
import { FriendsModule } from './friends/friends.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { StripeService } from './stripe/stripe.service';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    ChatModule,
    ConversationsModule,
    EventsModule,
    AwsModule,
    MembersModule,
    InvitationsModule,
    FriendsModule,
  ],
  controllers: [AppController],
  providers: [AppService, StripeService],
})
export class AppModule {}
