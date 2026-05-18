import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserCredential } from '../entities/user-credential.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class UserCredentialService {
  constructor(
    @InjectRepository(UserCredential)
    private readonly userCredentialRepo: Repository<UserCredential>,
  ) {}

  async fortgotPassword(userId: string) {
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

    return { message: 'Please check your email for further instructions.' };
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
