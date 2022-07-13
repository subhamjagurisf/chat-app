// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/context';
import {
  getModelSchemaRef,
  post,
  get,
  requestBody,
  param,
} from '@loopback/openapi-v3';
import {Response, RestBindings, response, HttpErrors} from '@loopback/rest';
import {CONTENT_TYPE, STATUS_CODE} from '@sourceloop/core';
import axios from 'axios';
import {authorize} from 'loopback4-authorization';
import {IAuthGoogleBody} from '../interfaces/auth-google-body';
import {AuthServiceBindingsKeys, JWTServiceBindingsKeys} from '../keys';
import {AuthUser} from '../models';
import {AuthService} from '../services/auth.service';
import {JWTService} from '../services/jwt.service';
import {getTokens} from '../utils/google-tokens';

// import {inject} from '@loopback/core';

export class AuthController {
  constructor(
    @inject(AuthServiceBindingsKeys.AUTH_SERVICE)
    public authService: AuthService,
    @inject(JWTServiceBindingsKeys.JWT_SERVICE)
    public jwtService: JWTService,
  ) {}

  @authorize({permissions: ['*']})
  @get('/auth/google')
  @response(200, {
    description: 'Google OAuth',
  })
  async authGoogle() {
    const redirectUrl = `${process.env.GOOGLE_AUTH_URL}?redirect_uri=${process.env.GOOGLE_AUTH_CALLBACK_URL}&client_id=${process.env.GOOGLE_AUTH_CLIENT_ID}&access_type=offline&response_type=code&prompt=consent&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email`;
    return {
      status: 'OK',
      redirectUrl,
    };
  }

  @authorize({permissions: ['*']})
  @get('/auth/google-auth-redirect')
  @response(200, {
    description: 'google auth callback',
  })
  async authCallback(@param.query.string('code') code: string) {
    try {
      console.log('code in auth service', code);
      const {id_token, access_token} = await getTokens({
        code,
        clientId: process.env.GOOGLE_AUTH_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
        redirectUri: process.env.GOOGLE_AUTH_CALLBACK_URL!,
      });

      // Fetch the user's profile with the access token and bearer
      const googleUser = await axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
          {
            headers: {
              Authorization: `Bearer ${id_token}`,
            },
          },
        )
        .then(res => res.data)
        .catch(error => {
          throw new Error(error.message);
        });
      const newUser = await this.authService.loginOrSignup(googleUser);
      const token = await this.jwtService.generateToken(newUser);
      console.log(token);
      return {token, user: newUser};
    } catch (error) {
      console.log(error);
      throw new HttpErrors.BadRequest();
    }
  }
}
