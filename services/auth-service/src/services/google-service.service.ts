import {injectable, /* inject, */ BindingScope} from '@loopback/core';

@injectable({scope: BindingScope.TRANSIENT})
export class GoogleServiceService {
  constructor(/* Add @inject to inject parameters */) {}
}
