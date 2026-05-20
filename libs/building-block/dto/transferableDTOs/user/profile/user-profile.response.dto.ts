import { AutoMap } from '@automapper/classes';

export class UserProfileResponseDto {
  @AutoMap()
  id: string;

  @AutoMap()
  firstName: string;

  @AutoMap()
  lastName: string;

  @AutoMap()
  contact: string;

  @AutoMap()
  country: string;

  @AutoMap()
  companyRegNo: string;

  @AutoMap()
  companyName: string;

  @AutoMap()
  userId: string;

  @AutoMap()
  walletAddress: string;

  @AutoMap()
  provider: string;
}
