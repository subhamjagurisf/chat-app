import * as jwt from 'jsonwebtoken';
import {AuthUser} from '../models';

/**
 * This service provides functionalities like
 *  Generating a jwt token for a auth user
 */
export class JWTService {
  async generateToken(authUser: AuthUser): Promise<string> {
    return jwt.sign({...authUser}, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN,
      issuer: process.env.JWT_ISSUER,
    });
  }
}
