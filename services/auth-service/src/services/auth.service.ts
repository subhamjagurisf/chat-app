import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {AuthUser} from '../models';
import {AuthUserRepository} from './../repositories/auth-user.repository';

export class AuthService {
  constructor(
    @repository(AuthUserRepository)
    public authUserRepository: AuthUserRepository,
  ) {}
  async verifyCredentials(credentials: any): Promise<AuthUser> {
    const authUser = await this.authUserRepository.findOne({
      where: {
        email: credentials.email,
      },
    });

    if (!authUser) {
      throw new HttpErrors.Unauthorized('User with this email does not exist');
    }

    const passwordMatched = false;

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Invalid Password');
    }
    return authUser;
  }

  async loginOrSignup(user: AuthUser): Promise<AuthUser> {
    const authUser = await this.authUserRepository.findOne({
      where: {
        email: user.email,
      },
    });

    if (authUser) {
      return authUser;
    }

    return await this.authUserRepository.create({
      email: user.email,
      username: user.email,
      permissions: [
        'ViewMessage',
        'CreateMessage',
        'UpdateMessage',
        'DeleteMessage',
        'CreateMessageRecipient',
        'ViewMessageRecipient',
        'UpdateMessageRecipient',
        'DeleteMessageRecipient',
        'ViewNotification',
        'CreateNotification',
        'UpdateNotification',
        'DeleteNotification',
        'CanGetNotificationAccess',
      ],
    });
  }
}
