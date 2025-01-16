import { Router } from 'express';
import { body } from 'express-validator';
import redis, { getDailyUserKey } from '@/utils/redis.js';
import { checkInteractionQuota, isAuthenticated } from '@/utils/middlewares.js';
import User from '@/db/models/User.js';
import UserLike from '@/db/models/UserLike.js';

const router = Router();

router.get('/', isAuthenticated, checkInteractionQuota, async (req, res) => {
  const currentUserId = req.user!.id;
  const key = getDailyUserKey(currentUserId);
  try {
    const interactionCount = await redis.scard(key);
    if (req.user!.quotaEnabled && interactionCount >= 10) {
      res.status(403).json({
        message: 'Please purchase premium plan to unlock more swipes!',
      });
    }
    const viewedUserIds = await redis.smembers(key);
    const users = await User.query()
      .alias('u')
      .select('u.id', 'u.full_name', 'u.bio', 'u.verified')
      .leftJoin('user_like as ul', 'u.id', 'ul.user_id')
      .whereNotIn('u.id', [...viewedUserIds, currentUserId])
      .whereNull('ul.liked_user_id')
      .orderByRaw('RANDOM()')
      .limit(10);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Encountered uncaught error',
      error: err,
    });
  }
});

router.post(
  '/:userId',
  isAuthenticated,
  checkInteractionQuota,
  body('like').isBoolean().default(false),
  async (req, res) => {
    const currentUserId = req.user!.id;
    const { userId } = req.params;

    if (currentUserId === userId) {
      res.status(403).json({ message: 'May not self-like' });
    } else {
      const { like } = req.body;
      const key = getDailyUserKey(currentUserId);
      try {
        const isNewInteraction = await redis.sadd(key, userId);
        if (!isNewInteraction) {
          res.status(400).json({ message: 'Already interacted today' });
        } else {
          if (!like) {
            res.json({ message: 'Pass sent' });
          } else {
            const userLike = await UserLike.query()
              .findOne({
                user_id: currentUserId,
                liked_user_id: userId,
              })
              .first();
            if (!userLike) {
              await UserLike.query().insert({
                userId: currentUserId,
                likedUserId: userId,
              });
            }
            res.json({ message: 'Like sent' });
          }
        }
      } catch (err) {
        await redis.srem(key, userId);
        console.error(err);
        res.status(500).json({
          message: 'Encountered uncaught error',
          error: err,
        });
      }
    }
  },
);

export default router;
