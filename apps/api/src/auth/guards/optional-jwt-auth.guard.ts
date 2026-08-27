import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Default AuthGuard throws on missing/invalid token; overriding
  // handleRequest to just return the user-or-undefined instead makes auth
  // optional for this one guard without touching JwtStrategy at all.
  handleRequest(_err: any, user: any) {
    return user; // undefined if no/invalid token — never throws here
  }
}
