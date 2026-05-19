import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserProfile } from '../entities/user-profile.entity';
import { SetUserProfileDto } from '@requestable-dto/user/profile/set-user-profilt.dto';
import { SaveUserWalletDto } from '@requestable-dto/user/profile/save-user-wallet.dto';
import { UserService } from './user.service';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper } from '@automapper/core';
import { UserProfileResponseDto } from '@transferable-dto/user/profile/user-profile.response.dto';

@Injectable()
export class UserProfileService extends AutomapperProfile {
  constructor(
    @InjectMapper() readonly mapper: Mapper,

    @InjectRepository(UserProfile)
    private readonly userProfile: Repository<UserProfile>,

    private readonly userService: UserService,
  ) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, UserProfile, UserProfileResponseDto);
    };
  }

  async setProfile(payload: SetUserProfileDto, userId: string) {
    await this.userService.findById(userId);

    let profile = await this.userProfile.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) {
      profile = this.userProfile.create({
        firstName: payload.firstName,
        lastName: payload.lastName,
        contact: payload.contact,
        country: payload.country,
        userId,
      });
    } else {
      profile.firstName = payload.firstName;
      profile.lastName = payload.lastName;
      profile.contact = payload.contact;
      profile.country = payload.country;
    }

    return await this.userProfile.save(profile);
  }

  async saveWallet(payload: SaveUserWalletDto, userId: string) {
    await this.userService.findById(userId);

    const normalizedAddress = payload.walletAddress.trim();

    const existingByAddress = await this.userProfile.findOne({
      where: { walletAddress: normalizedAddress },
    });

    if (existingByAddress && existingByAddress.userId !== userId) {
      throw new ConflictException(
        'Wallet address is already linked to another account.',
      );
    }

    const profile = await this.getProfileByUserId(userId);


    profile.walletAddress = normalizedAddress;
    profile.provider = payload.provider?.trim() ?? null;

    return await this.userProfile.save(profile);
  }

  async getProfileByUserId(userId: string) {
    const profile = await this.userProfile.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(
        `Profile not found for user with id ${userId}`,
      );
    }

    // Order: (source, SourceClass, DestinationClass)
    const mappedUser = this.mapper.map(
      profile,
      UserProfile,
      UserProfileResponseDto,
    );

    return mappedUser;
  }
}
