import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from './config/google-oauth.config';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/db/prisma.service';
import { UserService } from 'src/user/user.service';
import { GoogleStrategy } from './strategies/google.strategy';
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      // signOptions: { expiresIn: '60s' },
    }),
    ConfigModule.forFeature(googleOauthConfig),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, PrismaService, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
