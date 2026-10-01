import express from 'express';
import { acceptFollowRequest, editProfile, followOrUnfollow, getFollowRequests, getProfile, getShareList, login, logout, register, rejectFollowRequest, searchUsers, suggestedUsers, togglePrivacy } from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/:id/profile').get(isAuthenticated, getProfile);
router.route('/profile/edit').post(isAuthenticated,upload.single('profilePhoto'),editProfile);

router.route('/suggested').get(isAuthenticated,suggestedUsers);
router.route('/search').get(isAuthenticated,searchUsers);

router.route('/followorunfollow/:id').post(isAuthenticated,followOrUnfollow);

router.route('/requests').get(isAuthenticated,getFollowRequests);
router.route('/requests/:id/accept').post(isAuthenticated,acceptFollowRequest);
router.route('/requests/:id/reject').post(isAuthenticated,rejectFollowRequest);
router.route('/privacy').post(isAuthenticated,togglePrivacy);
router.route('/share-list').get(isAuthenticated,getShareList);


export default router;

