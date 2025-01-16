import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import redis, { getDailyUserKey } from '@/utils/redis.js';

export const isNotAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.status(403).json({ message: 'Already authenticated' });
  }
};

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.sendStatus(401);
  }
};

export const validate: RequestHandler = (req, res, next) => {
  const vr = validationResult(req);
  if (!vr.isEmpty())
    res
      .status(422)
      .json({ success: false, message: 'Invalid inputs', errors: vr.array() });
  else {
    next();
  }
};

export const checkInteractionQuota: RequestHandler = async (req, res, next) => {
  const key = getDailyUserKey(req.user!.id);

  const keyExists = await redis.exists(key);
  if (!keyExists) {
    await redis.expire(key, 86400);
  }

  const interactionCount = await redis.scard(key);
  if (req.user!.quotaEnabled && interactionCount >= 10) {
    res.status(403).json({
      message: 'Please purchase premium plan to unlock more swipes!',
    });
  } else {
    next();
  }
};
