import {BindingKey} from '@loopback/context';
import {AuthService} from './services/auth.service';
import {JWTService} from './services/jwt.service';

export namespace AuthServiceBindingsKeys {
  export const AUTH_SERVICE = BindingKey.create<AuthService>('services.auth');
}

export namespace JWTServiceBindingsKeys {
  export const JWT_SERVICE = BindingKey.create<JWTService>('services.jwt');
}
