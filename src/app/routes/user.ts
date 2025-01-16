import { Router } from 'express';
import { body, matchedData } from 'express-validator';
import bcrypt from 'bcrypt';
import passport from 'passport';
import {
  isAuthenticated,
  isNotAuthenticated,
  validate,
} from '@/utils/middlewares.js';
import User from '@/db/models/User.js';

const router = Router();

router.get('/me', isAuthenticated, (req, res) => {
  const { id, email, fullName, bio, verified, quotaEnabled } = req.user as User;
  res.json({ id, email, fullName, bio, verified, quotaEnabled });
});

router.post(
  '/me',
  isAuthenticated,
  body('fullName').trim().optional(),
  body('bio').trim().isString(),
  validate,
  async (req, res) => {
    const { fullName, bio } = matchedData(req);
    try {
      await User.query().patch({
        fullName: String(fullName).trim(),
        bio: String(bio).trim(),
      });
      res.json({ message: 'Update successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Encountered uncaught error',
        error: err,
      });
    }
  },
);

router.post(
  '/login',
  isNotAuthenticated,
  passport.authenticate('local', { session: true }),
  (req, res) => {
    res
      .status(200)
      .json({ message: 'Logged in successfully', userId: req.user!.id });
  },
);

router.all('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('connect.sid'); // Clear session cookie
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

router.post(
  '/register',
  isNotAuthenticated,
  body('email').trim().isEmail(),
  body('password').trim().isLength({ min: 6, max: 128 }),
  body('fullName').trim(),
  validate,
  async (req, res) => {
    const { email, password, fullName } = matchedData(req);
    try {
      const userExists = await User.userExists(email);
      if (userExists) {
        res.status(403).json({ message: `User already registered` });
      } else {
        const hashed = await bcrypt.hash(password, 10);
        await User.query().insert({ email, password: hashed, fullName });
        res.status(200).json({ message: 'Registration successful' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Encountered uncaught error',
        error: err,
      });
    }
  },
);

export default router;
