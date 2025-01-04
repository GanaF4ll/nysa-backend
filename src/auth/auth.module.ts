import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/db/prisma.service';
import { UserService } from 'src/user/user.service';
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      // signOptions: { expiresIn: '60s' },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
