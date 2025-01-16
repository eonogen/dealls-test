import { Router } from 'express';
import { body, matchedData } from 'express-validator';
import { UNLIMITED_QUOTA, VERIFIED_BADGE } from '@/constants/purchaseTypes.js';
import User from '@/db/models/User.js';
import { isAuthenticated, validate } from '@/utils/middlewares.js';
import Purchase from '@/db/models/Purchase.js';

const router = Router();

router.post(
  '/purchase',
  isAuthenticated,
  body('type').isString().isIn([VERIFIED_BADGE, UNLIMITED_QUOTA]),
  validate,
  async (req, res) => {
    try {
      const currentUserId = req.user!.id;
      const { type } = matchedData(req);
      let patchQuery: { verified?: boolean; quotaEnabled?: boolean } = {};
      if (type === VERIFIED_BADGE) {
        patchQuery = { verified: true };
      } else if (type === UNLIMITED_QUOTA) {
        patchQuery = { quotaEnabled: false };
      }
      await User.query().patch(patchQuery).where({ id: currentUserId });
      await Purchase.query().insert({ userId: currentUserId, type });
      res.sendStatus(202);
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
