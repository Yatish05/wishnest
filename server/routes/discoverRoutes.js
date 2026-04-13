import express from 'express';
import { discoverGifts } from '../controllers/wishlistController.js';

const router = express.Router();

router.get('/', discoverGifts);

export default router;
