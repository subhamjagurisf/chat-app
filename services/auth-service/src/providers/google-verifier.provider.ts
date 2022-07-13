import {Provider} from '@loopback/context';
import {verify} from 'jsonwebtoken';
import {VerifyFunction} from 'loopback4-authentication';
import {AuthUser} from '../models';

export class GoogleVerifierProvider
  implements Provider<VerifyFunction.GoogleAuthFn>
{
  constructor() {}

  value(): VerifyFunction.GoogleAuthFn {
    return async token => {
      // if (token && (await this.revokedTokenRepository.get(token))) {
      //   throw new HttpErrors.Unauthorized('Token Revoked');
      // }
      const {authUser} = verify(token, process.env.JWT_SECRET as string, {
        issuer: process.env.JWT_ISSUER,
      }) as {authUser: AuthUser};

      return authUser;
    };
  }
}
