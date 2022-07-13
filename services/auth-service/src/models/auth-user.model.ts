import {Entity, model, property} from '@loopback/repository';
import {IAuthUser} from 'loopback4-authentication';
import {Permissions} from 'loopback4-authorization';

@model()
export class AuthUser extends Entity implements IAuthUser, Permissions<string> {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  permissions: string[];

  constructor(data?: Partial<AuthUser>) {
    super(data);
  }
}

export interface AuthUserRelations {
  // describe navigational properties here
}

export type AuthUserWithRelations = AuthUser & AuthUserRelations;
