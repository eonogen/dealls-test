import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

import User from '@/db/models/User.js';

passport.use(
  'local',
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.query()
      .findOne({ email })
      .then((user) => {
        if (!user) {
          // User not found
          done(undefined, false, { message: 'User not found' });
        } else {
          bcrypt
            .compare(password, user.password)
            .then((same) => {
              if (same) {
                // Passwords match
                done(undefined, user);
              } else {
                // Passwords mismatch
                done(undefined, false, { message: 'Password mismatch' });
              }
            })
            .catch(done);
        }
      })
      .catch(done);
  }),
);

passport.serializeUser((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id: string, done) => {
  User.query()
    .findById(id)
    .then((user) => done(undefined, user))
    .catch(done);
});

export default passport;
