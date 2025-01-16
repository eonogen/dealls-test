import { Router } from 'express';
import redis from '@/utils/redis.js';

const router = Router();

router.get('/redis_flush', async (req, res) => {
  try {
    await redis.flushall();
    res.json({ message: 'Flushed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Encountered uncaught error',
      error: err,
    });
  }
});

export default router;
