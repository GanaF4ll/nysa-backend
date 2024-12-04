import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './db/prisma.module';
import { UserModule } from './user/user.module';
import { WebsocketModule } from './websocket/websocket.module';
@Module({
  imports: [AuthModule, PrismaModule, ConfigModule.forRoot({ isGlobal: true }), UserModule, WebsocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
