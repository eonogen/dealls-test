import express, { ErrorRequestHandler } from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';

import redis from '@/utils/redis.js';
import passport from '@/utils/passport.js';

import userRouter from './routes/user.js';
import matchRouter from './routes/matching.js';
import premiumRouter from './routes/premium.js';
import devRouter from './routes/dev.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    store: new RedisStore({
      client: redis,
      prefix: 'sswiper:session:',
    }),
    secret: 's3ss!on-s3cre7',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }, // This is a demo app, must be secured on prod!
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/user', userRouter);
app.use('/matching', matchRouter);
app.use('/premium', premiumRouter);
app.use('/dev', devRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

/**
 * Catch-all error handler
 * @param err NodeJS Error object
 * @param req Express Request object
 * @param res Express Response object
 * @param next Express Next Function object
 */
const errHandler: ErrorRequestHandler = (
  err: NodeJS.ErrnoException,
  req,
  res,
  next, // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  console.error('Uncaught error: ', err);
  res.status(500).json({
    error: err,
  });
};

app.use(errHandler);

export default app;
