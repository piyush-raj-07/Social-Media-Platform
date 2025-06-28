import express from 'express';
import { addComment, addNewPost, bookmarkPost, deletePost, getCommentofPost, getUserPosts, likePost } from '../controllers/post.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.route("/addPost").post(isAuthenticated,upload.single('image'),addNewPost);
router.route("/all").get(isAuthenticated,getUserPosts);
// router.route("/userpost/all").get(isAuthenticated,getUserPosts);
router.route("/:id/like").get(isAuthenticated,likePost);
router.route("/:id/comment").get(isAuthenticated,addComment);
router.route("/:id/comment/all").post(isAuthenticated,getCommentofPost);
router.route("/delete/:id").post(isAuthenticated,deletePost);
router.route("/:id/bookmark").post(isAuthenticated,bookmarkPost);

export default router;
