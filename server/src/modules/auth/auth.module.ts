import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from '../../config/jwt.config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

const jwtOptions: JwtModuleOptions = {
  secret: jwtConfig.secret,
  signOptions: {
    // JWT accepts '7d' etc.; Nest typings expect number | StringValue
    expiresIn: jwtConfig.expiresIn as never,
  },
};

@Module({
  imports: [PassportModule, JwtModule.register(jwtOptions)],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
