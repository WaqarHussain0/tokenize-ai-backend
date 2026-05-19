import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserCredential } from '../entities/user-credential.entity';
import { randomBytes } from 'crypto';
import { EmailService } from '@modules/app-shared/services/email.service';
import { forgotPasswordTemplate } from '@email-templates/forgot-password.template';

@Injectable()
export class UserCredentialService {
  constructor(
    @InjectRepository(UserCredential)
    private readonly userCredentialRepo: Repository<UserCredential>,
    private readonly emailService: EmailService,
  ) {}

  async fortgotPassword(userId: string, email: string) {
    // Mark all previous unused reset tokens as used
    await this.userCredentialRepo.update(
      { isUsed: false, userId },
      { isUsed: true },
    );

    // Generate a random token (15 characters)
    const token = randomBytes(15).toString('hex');

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5); // expires in 5 minutes

    const saveEntity = this.userCredentialRepo.create({
      userId,
      resetPasswordToken: token,
      expiry,
      isUsed: false,
    });

    await this.userCredentialRepo.save(saveEntity);

    // prepare email template
    const html = forgotPasswordTemplate({
      resetPasswordLink: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
    });

    await this.emailService.sendMail({
      subject: 'Tokenize AI - Reset Password Request',
      html,
      to: email,
    });

    return { message: 'Please check your email for further instructions.' };
  }

  async resendResetPasswordEmail(userId: string, email: string) {
    const now = new Date();

    // Cooldown Check to avoid spam clicking
    const lastToken = await this.userCredentialRepo.findOne({
      where: { userId },
      order: { expiry: 'DESC' },
    });

    if (lastToken?.createdAt) {
      const diff = now.getTime() - new Date(lastToken.createdAt).getTime();

      // 60 seconds cooldown
      if (diff < 60 * 1000) {
        return {
          message: 'Please wait before requesting another reset email.',
        };
      }
    }

    // Mark all previous tokens as used
    await this.userCredentialRepo.update(
      { userId, isUsed: false },
      { isUsed: true },
    );

    // Generate new token
    const token = randomBytes(15).toString('hex');

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);

    // Save new token
    await this.userCredentialRepo.save(
      this.userCredentialRepo.create({
        userId,
        resetPasswordToken: token,
        expiry,
        isUsed: false,
      }),
    );

    // Email template
    const html = forgotPasswordTemplate({
      resetPasswordLink: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
    });

    // Send email
    await this.emailService.sendMail({
      subject: 'Tokenize AI - Resend Reset Passowrd Request',
      html,
      to: email,
    });

    return {
      message: 'Reset password email has been resent successfully.',
    };
  }

  async findByToken(resetPasswordToken: string) {
    return await this.userCredentialRepo.findOne({
      where: { resetPasswordToken, expiry: MoreThan(new Date()) },
    });
  }

  async markTokenAsUsed(credentialId: string) {
    return await this.userCredentialRepo.update(
      { id: credentialId },
      { isUsed: true },
    );
  }
}
