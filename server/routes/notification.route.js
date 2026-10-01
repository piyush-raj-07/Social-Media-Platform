import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { getNotifications, markNotificationsRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.route('/all').get(isAuthenticated, getNotifications);
router.route('/read').post(isAuthenticated, markNotificationsRead);

export default router;
