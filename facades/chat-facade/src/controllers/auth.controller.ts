// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/context';
import {get, param, post, requestBody} from '@loopback/openapi-v3';
import {RestBindings, Response, HttpErrors} from '@loopback/rest';
import {STATUS_CODE, CONTENT_TYPE, SuccessResponse} from '@sourceloop/core';
import {AuthErrorKeys} from 'loopback4-authentication';
import {authorize} from 'loopback4-authorization';
import {Auth} from '../services/auth.service';

// import {inject} from '@loopback/core';

export class AuthController {
  constructor(
    @inject('services.Auth')
    private readonly authService: Auth,
  ) {}

  @authorize({permissions: ['*']})
  @get('/auth/google', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Google authentication',
        content: {
          [CONTENT_TYPE.FORM_URLENCODED]: {
            type: 'string',
          },
        },
      },
    },
  })
  async authGoogle(@inject(RestBindings.Http.RESPONSE) response: Response) {
    try {
      const data = await this.authService.auth();
      if (data?.body?.status === 'OK') {
        const redirectUrl = data?.body?.redirectUrl;
        return response.redirect(redirectUrl);
      } else {
        throw new HttpErrors.BadRequest(AuthErrorKeys.UnknownError);
      }
    } catch (error) {
      throw new HttpErrors.BadRequest(AuthErrorKeys.UnknownError);
    }
  }

  @authorize({permissions: ['*']})
  @get('/auth/google-auth-redirect')
  async authGoogleRedirect(
    @param.query.string('code') code: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    try {
      const res = await this.authService.redirect(code);
      console.log('res.body', res.body);
      return response.redirect(
        `${process.env.CLIENT_URL!}?accessToken=${res.body.token}`,
      );
    } catch (error) {
      // console.log(error);
      // throw new HttpErrors.Unauthorized(AuthErrorKeys.UnknownError);
    }
  }
}
