import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserProfileService } from '../services/user-profile.service';
import { SetUserProfileDto } from '@requestable-dto/user/profile/set-user-profilt.dto';
import { SaveUserWalletDto } from '@requestable-dto/user/profile/save-user-wallet.dto';
import { User } from '../entities/user.entity';
import { CurrentUser, Public } from '@modules/auth/decorators';
import { JwtAuthGuard } from '@modules/auth/guards';

@ApiTags('User Profile')
@Controller('user-profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post('set-profile')
  @ApiOperation({
    summary: 'Set user profile',
    description:
      'Updates the profile information for a specific user, including first name and last name',
  })
  async setProfile(
    @Body() payload: SetUserProfileDto,
    @CurrentUser() user: User,
  ) {
    return await this.userProfileService.setProfile(payload, user.id);
  }

  @Public()
  @Post('save-wallet')
  @ApiOperation({
    summary: 'Save user wallet',
    description:
      'Stores the public wallet address and provider on the user profile',
  })
  async saveWallet(@Body() payload: SaveUserWalletDto) {
    return await this.userProfileService.saveWallet(payload);
  }

  @Public()
  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user whose profile is being retrieved',
    required: true,
  })
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieves the profile information for a specific user',
  })
  async getProfile(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return await this.userProfileService.getProfileByUserId(userId);
  }
}
