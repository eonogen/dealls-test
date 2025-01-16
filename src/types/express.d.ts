import UserModel from '@/db/models/User.js';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends UserModel {}
  }
}
