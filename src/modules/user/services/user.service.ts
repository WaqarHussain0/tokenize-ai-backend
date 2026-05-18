import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '@requestable-dto/user/create-user.dto';
import * as bcrypt from 'bcrypt';
import { BaseQueryDto } from '@base-classes/pagination/base-query.dto';
import { PageDto } from '@base-classes/pagination/page.dto';
import { PageMetaDto } from '@base-classes/pagination/page-meta.dto';
import { UserResponseDto } from '@transferable-dto/user/user.response.dto';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { UserProfile } from '../entities/user-profile.entity';
import { UserProfileResponseDto } from '@transferable-dto/user/profile/user-profile.response.dto';
import { welcomeEmailTemplate } from '@email-templates/welcome-email.template';
import { EmailService } from '@modules/app-shared/services/email.service';
import { UserReferralService } from './user-referrals.service';
@Injectable()
export class UserService extends AutomapperProfile {
  constructor(
    @InjectMapper() readonly mapper: Mapper,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly emailService: EmailService,

    private readonly userReferralService: UserReferralService,
  ) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, UserProfile, UserProfileResponseDto);

      createMap(
        mapper,
        User,
        UserResponseDto,
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
   * Hash a password
   * @param password - The plain text password
   * @returns Promise<string> - The hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Validate user password
   * @param password - The plain text password
   * @param hashedPassword - The hashed password to compare against
   * @returns Promise<boolean> - True if password matches
   */
  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private async generateUniqueReferralCode(): Promise<string> {
    let code: string;
    let exists: User | null;

    do {
      const prefix = 'INV';
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();

      const timestamp = Date.now().toString().slice(-4);

      code = `${prefix}-${random}${timestamp}`;

      exists = await this.findByReferralCode(code);
    } while (exists);

    // Example Output : INV-X7K9QD4821, INV-A1B2C33901
    return code;
  }

  async findById(id: string, loadRelations = false) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: loadRelations ? ['profile'] : undefined,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (loadRelations) {
      const mappedUser = this.mapper.map(user, User, UserResponseDto);
      return mappedUser;
    }

    return user;
  }

  async findByEmail(email: string, loadRelations = false): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        email: email.toLowerCase().trim(),
      },
      relations: loadRelations ? ['profile'] : undefined,
    });

    return user;
  }

  async findByReferralCode(referralCode: string) {
    return await this.userRepository.findOne({
      where: { referralCode },
    });
  }

  async create(payload: CreateUserDto) {
    const { email, password, referralCode } = payload;

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(
        `User with email ${email} already exists, please choose a different email. `,
      );
    }

    let hashedPassword: string = '';

    // Hash password if provided
    if (password) {
      hashedPassword = await this.hashPassword(password);
    }

    /**
     * Step 1: Prepare referral (if provided)
     */
    let referrerUser: User | null = null;

    if (referralCode) {
      referrerUser = await this.findByReferralCode(referralCode);

      if (!referrerUser) {
        throw new ConflictException('Invalid referral code.');
      }
    }

    // user could pass own referralCode
    if (referrerUser && referrerUser.email === email) {
      throw new BadRequestException('Self-referral is not allowed.');
    }

    /**
     * Step 2: Create user
     */

    const userReferralCode = await this.generateUniqueReferralCode();

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      referralCode: userReferralCode,
    });

    const savedUser = await this.userRepository.save(user);

    /**
     * Step 3: Create referral record (if applicable)
     */
    if (referrerUser) {
      await this.userReferralService.assignReferral({
        referredUserId: savedUser.id,
        referredByUserId: referrerUser.id,
      });
    }

    /**
     * Step 4: Send welcome email
     */

    // prepare email template
    const html = welcomeEmailTemplate({
      loginPageLink: `${process.env.FRONTEND_URL}/login`,
    });

    await this.emailService.sendMail({
      subject: 'Welcome to Tokenize AI',
      html,
      to: savedUser.email,
    });

    return savedUser;
  }

  async updatePassword(userId: string, password: string) {
    const hashPassword = await this.hashPassword(password);
    return await this.userRepository.update(
      { id: userId },
      { password: hashPassword },
    );
  }

  /**
   * Get all with optional filtering
   */

  async findAll(
    pageOptionsDto: BaseQueryDto,
  ): Promise<PageDto<UserResponseDto>> {
    const { filters, skip, take } = pageOptionsDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'search') {
          queryBuilder.andWhere(
            `(LOWER(user.email) LIKE :search 
            OR LOWER(profile.firstName) LIKE :search
            OR LOWER(profile.lastName) LIKE :search)`,
            {
              search: `%${value.toString().toLowerCase()}%`,
            },
          );
        } else {
          queryBuilder.andWhere(`user.${key} = :${key}`, {
            [key]: value,
          });
        }
      });
    }

    // Step 1: count total with the same filters
    const total = await queryBuilder.clone().getCount();

    const users = await queryBuilder
      .skip(skip)
      .take(take)
      .orderBy('user.createdAt', 'DESC')
      .getMany();

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount: total,
    });

    const mappedUsers = this.mapper.mapArray(users, User, UserResponseDto);

    return new PageDto(mappedUsers, pageMetaDto);
  }

  async verifyEmail(email: string) {
    return await this.userRepository.update(
      { email: email.toLowerCase().trim() },
      { emailVerified: true },
    );
  }

  async toggleUserActiveStatus(userId: string) {
    const user = await this.findById(userId);

    return await this.userRepository.update(
      { id: userId },
      { isActive: !user.isActive },
    );
  }
}
