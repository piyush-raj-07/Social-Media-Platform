import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";

export const addNewPost = async (req, res) => {
  try {
    const caption = req.body.caption;
    const image = req.file;
    const authorId = req.id;

    if (!image) {
      return res.status(400).json({
        message: "Image is required",
        success: false,
      });
    }

    console.log("Resizing image...");
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize(800, 800, { fit: 'inside' })
      .toFormat('jpeg', { quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
    console.log("Uploading image to Cloudinary...");
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    console.log("Image uploaded");

    const post = await Post.create({
      caption: caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });

    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate({
      path: 'author',
      select: '-password',
    });

    return res.status(201).json({
      message: "Post created successfully",
      success: true,
      post: post,
    });

  } catch (error) {
    console.error("Error adding new post:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
}




export const getUserPosts = async (req, res) => {
    try {
        const userId = req.id;

        const posts = await Post.find({ author: userId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username profilePicture',
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate:{
                path: 'author',
                select: 'username profilePicture',
            }
        })

        return res.status(200).json({
            message: "User posts fetched successfully",
            success: true,
            posts: posts,
        });

    }
    catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}


export const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found", success: false });
        }

        if (post.likes.includes(userId)) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        //implement socket io for real tiome notifiacation

        return res.status(200).json({
            message: "Post liked/unliked successfully",
            success: true,
            likesCount: post.likes.length,
        });

    } catch (error) {
        console.error("Error liking/unliking post:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}


export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;
        const { comment } = req.body;

        if (!comment || comment.trim() === "") {
            return res.status(400).json({ message: "Comment cannot be empty", success: false });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found", success: false });
        }

        const commentData = await Comment.create({
            text: comment,
            author: userId,
            post: postId, // ✅ fixed key
        });

        await commentData.populate({
            path: 'author',
            select: 'username profilePicture',
        });

        post.comments.push(commentData._id);
        await post.save();

        return res.status(201).json({
            message: "Comment added successfully",
            success: true,
            comment: commentData,
        });

    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};


export const getCommentofPost = async(req,res)=>{
    try {
        const postId = req.params.id;

        const comments=  await Comment.find({post: postId}).populate({
           path: 'author',
           select: 'username profilePicture',
        })

        if(!comments){
            return res.status(404).json({ message: "No comments found for this post", success: false });
        }

        return res.status(200).json({
            message: "Comments fetched successfully",
            success: true,
            comments: comments,
        });


    }
    catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found", success: false });
        }

        if (post.author.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this post", success: false });
        }

        await post.remove();

        
        const user = await User.findById(userId);
        if (user) {
            user.posts.pull(postId);
            await user.save();
        }

        // Optionally, delete all comments associated with the post
        await Comment.deleteMany({ posts: postId });



        return res.status(200).json({
            message: "Post deleted successfully",
            success: true,
        });

    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found", success: false });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if (user.bookmarks.includes(postId)) {
            user.bookmarks.pull(postId);
        } else {
            user.bookmarks.push(postId);
        }

        await user.save();

        return res.status(200).json({
            message: user.bookmarks.includes(postId) ? "Post bookmarked successfully" : "Post unbookmarked successfully",
            success: true,
            bookmarksCount: user.bookmarks.length,
        });

    } catch (error) {
        console.error("Error bookmarking/unbookmarking post:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}
