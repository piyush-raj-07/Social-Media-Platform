import sharp from "sharp";
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";
import  Post  from "../models/post.model.js";
import  User  from "../models/user.model.js";
import  Comment  from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import canViewPosts from "../utils/canViewPosts.js";
import Notification from "../models/notification.model.js";
import { createNotification } from "../utils/notification.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) return res.status(400).json({ message: 'Image required' });

        // image upload 
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        // buffer to data uri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: 'New post added',
            post,
            success: true,
        })

    } catch (error) {
        console.log(error);
    }
}
const FEED_LIMIT = 20;

// feed -> 20 posts at a time
// /post/all?type=following&cursor=<last post id>  (type: following | suggested)
export const getAllPost = async (req, res) => {
    try {
        const userId = req.id;
        const { type, cursor } = req.query;

        const me = await User.findById(userId).select('following');
        if (!me) return res.status(404).json({ message: 'User not found', success: false });

        const myIds = [userId, ...me.following]; // you + people you follow

        let filter;
        if (type === 'suggested') {
            // posts of public accounts you don't follow
            const publicUsers = await User.find({ _id: { $nin: myIds }, isPrivate: { $ne: true } }).select('_id');
            filter = { author: { $in: publicUsers.map(user => user._id) } };
        } else {
            // your posts + posts of people you follow
            filter = { author: { $in: myIds } };
        }

        // only posts older than the last post the user already has
        if (cursor && mongoose.isValidObjectId(cursor)) {
            filter._id = { $lt: cursor };
        }

        // take 1 extra post to know if there are more posts
        const posts = await Post.find(filter)
            .sort({ _id: -1 })
            .limit(FEED_LIMIT + 1)
            .populate({ path: 'author', select: 'username profilePicture' });

        const hasMore = posts.length > FEED_LIMIT;
        if (hasMore) posts.pop();

        return res.status(200).json({
            posts,
            nextCursor: posts.length > 0 ? posts[posts.length - 1]._id : null,
            hasMore,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
};
export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username, profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username, profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const likePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        const canView = await canViewPosts(likeKrneWalaUserKiId, post.author);
        if (!canView) return res.status(403).json({ message: 'This account is private', success: false });

        const alreadyLiked = post.likes.includes(likeKrneWalaUserKiId);

        // like logic started
        await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // notification for post owner (saved in db + real time if online)
        if (!alreadyLiked) {
            await createNotification({
                receiver: post.author,
                sender: likeKrneWalaUserKiId,
                type: 'like',
                post: postId,
                message: 'liked your post'
            });
        }

        return res.status(200).json({message:'Post liked', success:true});
    } catch (error) {

    }
}
export const dislikePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // remove the like notification
        await Notification.deleteOne({ type: 'like', sender: likeKrneWalaUserKiId, post: postId });


        return res.status(200).json({message:'Post disliked', success:true});
    } catch (error) {

    }
}
export const addComment = async (req,res) =>{
    try {
        const postId = req.params.id;
        const commentKrneWalaUserKiId = req.id;

        const {text} = req.body;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});

        const canView = await canViewPosts(commentKrneWalaUserKiId, post.author);
        if(!canView) return res.status(403).json({message:'This account is private', success:false});

        if(!text) return res.status(400).json({message:'text is required', success:false});

        const comment = await Comment.create({
            text,
            author:commentKrneWalaUserKiId,
            post:postId
        })

        await comment.populate({
            path:'author',
            select:"username profilePicture"
        });
        
        post.comments.push(comment._id);
        await post.save();

        await createNotification({
            receiver: post.author,
            sender: commentKrneWalaUserKiId,
            type: 'comment',
            post: postId,
            message: `commented: ${text}`
        });

        return res.status(201).json({
            message:'Comment Added',
            comment,
            success:true
        })

    } catch (error) {
        console.log(error);
    }
};
export const getCommentsOfPost = async (req,res) => {
    try {
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});

        const canView = await canViewPosts(req.id, post.author);
        if(!canView) return res.status(403).json({message:'This account is private', success:false});

        // 20 comments at a time, newest first -> /post/:id/comment/all?cursor=<last comment id>
        const COMMENT_LIMIT = 20;
        const { cursor } = req.query;
        const filter = { post: postId };
        if(cursor && mongoose.isValidObjectId(cursor)) filter._id = { $lt: cursor };

        const comments = await Comment.find(filter)
            .sort({ _id: -1 })
            .limit(COMMENT_LIMIT + 1)
            .populate('author', 'username profilePicture');

        const hasMore = comments.length > COMMENT_LIMIT;
        if(hasMore) comments.pop();

        return res.status(200).json({
            success:true,
            comments,
            nextCursor: comments.length > 0 ? comments[comments.length - 1]._id : null,
            hasMore
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Internal server error', success:false});
    }
}
export const deletePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});

        // check if the logged-in user is the owner of the post
        if(post.author.toString() !== authorId) return res.status(403).json({message:'Unauthorized'});

        // delete post
        await Post.findByIdAndDelete(postId);

        // remove the post id from the user's post
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        // delete associated comments
        await Comment.deleteMany({post:postId});

        // delete notifications of this post
        await Notification.deleteMany({post:postId});

        return res.status(200).json({
            success:true,
            message:'Post deleted'
        })

    } catch (error) {
        console.log(error);
    }
}
export const bookmarkPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});
        
        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            // already bookmarked -> remove from the bookmark
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'unsaved', message:'Post removed from bookmark', success:true});

        }else{
            const canView = await canViewPosts(authorId, post.author);
            if(!canView) return res.status(403).json({message:'This account is private', success:false});

            // bookmark krna pdega
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'saved', message:'Post bookmarked', success:true});
        }

    } catch (error) {
        console.log(error);
    }
}