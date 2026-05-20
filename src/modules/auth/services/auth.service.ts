import { User } from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/services/user.service';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '@requestable-dto/auth/login.dto';
import { CreateUserDto } from '@requestable-dto/user/create-user.dto';
import { UserCredentialService } from './user-credential.service';
import { ResetPasswordDto } from '@requestable-dto/auth/reset-password.dto';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { LoginResponseDto } from '@transferable-dto/auth/login.response.dto';
import { UserProfileResponseDto } from '@transferable-dto/user/profile/user-profile.response.dto';
import { UserProfile } from '@modules/user/entities/user-profile.entity';
import { TokenTypeEnum } from '@enums/auth/user-credential.enum';
import { verifyEmailTemplate } from '@email-templates/verify-email.template';
import { EmailService } from '@modules/app-shared/services/email.service';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCredential } from '../entities/user-credential.entity';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService extends AutomapperProfile {
  constructor(
    @InjectMapper() readonly mapper: Mapper,

    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly userCredentialService: UserCredentialService,
    private readonly emailService: EmailService,

    @InjectRepository(UserCredential)
    private readonly userCredentialRepository: Repository<UserCredential>,
  ) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, UserProfile, UserProfileResponseDto);

      createMap(
        mapper,
        User,
        LoginResponseDto,
        forMember(
          (dest) => dest.profile,
          mapFrom((s) =>
            s.profile
              ? mapper.map(s.profile, UserProfile, UserProfileResponseDto)
              : null,
          ),
        ),
      );
    };
  }

  /**
   * Validate JWT token and return user
   * @param token - JWT token
   * @returns Promise<User> - The authenticated user
   * @throws UnauthorizedException if token is invalid
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.userService.findById(payload.sub);

      if (!user.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async register(payload: CreateUserDto) {
    return await this.userService.create(payload);
  }

  async emailVerificationCheck(user: User) {
    // If email not verified
    if (!user.emailVerified) {
      const token = randomBytes(32).toString('hex');

      await this.userCredentialRepository.save(
        this.userCredentialRepository.create({
          userId: user.id,
          token,
          type: TokenTypeEnum.EMAIL_VERIFICATION,
          isUsed: false,
        }),
      );

      const html = verifyEmailTemplate({
        verifyEmailLink: `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
      });

      // Send Email Verification Email
      await this.emailService.sendMail({
        subject: 'Tokenize AI - Verify Email',
        html,
        to: user.email,
      });

      // Throw exception with message
      throw new UnauthorizedException(
        'Your email is not verified. A verification email has been sent to your inbox.',
      );
    }
  }

  async login(payload: LoginDto): Promise<any> {
    const { email, password } = payload;

    // Find user by email
    const user = await this.userService.findByEmail(email, true);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.emailVerificationCheck(user);

    // Validate password
    const isPasswordValid = await this.userService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.isActive === false) {
      throw new UnauthorizedException(
        'User account is inactive, please contact admin to activate your account',
      );
    }

    // Generate JWT token
    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    // Order: (source, SourceClass, DestinationClass)
    const mappedUser = this.mapper.map(user, User, LoginResponseDto);

    const accessToken = this.jwtService.sign(jwtPayload);

    return { user: mappedUser, accessToken };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email not found');
    }

    return await this.userCredentialService.fortgotPassword(
      user.id,
      user.email,
    );
  }

  async resendResetPasswordEmail(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email not found');
    }

    return await this.userCredentialService.resendResetPasswordEmail(
      user.id,
      user.email,
    );
  }

  async resetPassword(payload: ResetPasswordDto) {
    const { token, password } = payload;

    const userCredentials = await this.userCredentialService.findByToken(token);

    if (
      !userCredentials ||
      userCredentials.isUsed ||
      userCredentials.expiry < new Date() ||
      userCredentials.type !== TokenTypeEnum.RESET_PASSWORD
    ) {
      throw new NotFoundException('Invalid or expired token');
    }

    await this.userCredentialService.markTokenAsUsed(userCredentials.id);

    await this.userService.updatePassword(userCredentials.userId, password);

    return true;
  }

  async verifyEmail(token: string) {
    return await this.userService.verifyEmail(token);
  }
}
