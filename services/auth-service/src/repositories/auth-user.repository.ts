import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AuthDbDataSource} from '../datasources';
import {AuthUser, AuthUserRelations} from '../models';

export class AuthUserRepository extends DefaultCrudRepository<
  AuthUser,
  typeof AuthUser.prototype.id,
  AuthUserRelations
> {
  constructor(
    @inject('datasources.authDb') dataSource: AuthDbDataSource,
  ) {
    super(AuthUser, dataSource);
  }
}
