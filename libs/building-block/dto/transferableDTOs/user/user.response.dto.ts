import { AutoMap } from '@automapper/classes';
import { UserProfileResponseDto } from './profile/user-profile.response.dto';

export class UserResponseDto {
  @AutoMap()
  id: string;

  @AutoMap()
  email: string;

  @AutoMap()
  isActive: boolean;

  @AutoMap()
  role: string;

  @AutoMap()
  emailVerified: boolean;

  @AutoMap(() => UserProfileResponseDto)
  profile: UserProfileResponseDto;
}
