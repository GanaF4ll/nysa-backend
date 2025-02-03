import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './db/prisma.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { ConversationModule } from './conversation/conversation.module';
import { EventModule } from './event/event.module';
import { AwsModule } from './aws/aws.module';
import { MemberModule } from './member/member.module';
import { InvitationModule } from './invitation/invitation.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    ChatModule,
    ConversationModule,
    EventModule,
    AwsModule,
    MemberModule,
    InvitationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
