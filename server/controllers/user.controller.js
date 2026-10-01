import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cloudinary from '../utils/cloudinary.js';
import getDataUri from '../utils/datauri.js';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Notification from '../models/notification.model.js';
import { createNotification, sendNotification } from '../utils/notification.js';



export const register = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password || !email) {
            return res.status(400).json(
                {
                    message: "All fields are required"
                    , success: false
                }
            );
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: "User already exists",
                success: false
            });
        }

        
        const user1 = await User.findOne({ username });
        if (user1) {
            return res.status(400).json({
                message: "User already exists",
                success: false
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username,
            password: hashedPassword,
            email
        })

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                username,
                email
            },
            success: true
        });

    }
    catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }

}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
                success: false
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
                , success: false
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password",
                success: false
            });
        }

        //generating a jwt token

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });

       const populatedPosts = await Promise.all(
    (user.posts || []).map(async (postId) => {
        const post = await Post.findById(postId);
        if (post && post.author && post.author.equals && post.author.equals(user._id)) {
            return post;
        }
        return null;
    })
);

        return res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'Strict', // Adjust as necessary
            maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
        }).status(200).json({
            message: "Login successful",
            user: {
                username: user.username,
                email: user.email,
                id: user._id,
                bio: user.bio || "",
                profilePicture: user.profilePicture || "",
                posts: populatedPosts,
                followers: user.followers || [],
                following: user.following || [],
                isPrivate: user.isPrivate || false,
                bookmarks: user.bookmarks || []

            },
            success: true
        });


    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}


export const logout = async (req, res) => {
    try {
        return res.clearCookie("token").status(200).json({
            message: "Logout successful",
            success: true
        });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const viewerId = req.id;
        // author is needed to open the post with comments from the profile page
        let user = await User.findById(userId).select('-password')
            .populate({ path: 'posts', options: { sort: { createdAt: -1 } }, populate: { path: 'author', select: 'username profilePicture' } })
            .populate({ path: 'bookmarks', populate: { path: 'author', select: 'username profilePicture' } });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        const isOwner = user._id.toString() === viewerId;
        const isFollower = user.followers.includes(viewerId);

        // private account posts are only visible to the owner and followers
        const isLocked = user.isPrivate && !isOwner && !isFollower;

        let followStatus = "none";
        if (isFollower) {
            followStatus = "following";
        } else if (user.followRequests.includes(viewerId)) {
            followStatus = "requested";
        }

        const profile = user.toObject();
        profile.postsCount = user.posts.length;
        profile.isLocked = isLocked;
        profile.followStatus = followStatus;

        if (isLocked) {
            profile.posts = [];
        }

        // saved posts and follow requests are only for the owner
        if (!isOwner) {
            profile.bookmarks = [];
            delete profile.followRequests;
        }

        return res.status(200).json({
            user: profile,
            success: true
        });

    }
    catch (error) {
        console.error("Error retrieving user profile:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const editProfile = async (req, res) => {
    try{
    const userId = req.id;
    const {bio,gender} = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    if(profilePicture){
        const fileUri = await getDataUri(profilePicture);
       cloudResponse =  await cloudinary.uploader.upload(fileUri);


    }

    const user =  await User.findByIdAndUpdate(userId);

    if(!user) {
        return res.status(404).json({
            message: "User not found",
            success: false
        });
    }

    if(bio) {
        user.bio = bio;
    }
    if(gender){
        user.gender= gender;
    }
    if(profilePicture) {
        user.profilePicture = cloudResponse.secure_url;
    }

    await user.save();

    return res.status(200).json({
        message: "Profile updated successfully",
        success:true,
        user
    });
    
    }
    catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
    
}

// fields needed to show a user in lists (never send email, bookmarks etc.)
const LIST_FIELDS = 'username profilePicture bio isPrivate followers followRequests';

const toListUser = (user, viewerId) => ({
    _id: user._id,
    username: user.username,
    profilePicture: user.profilePicture,
    bio: user.bio,
    isPrivate: user.isPrivate,
    followersCount: user.followers.length,
    // we already sent a follow request (don't send the whole requests list)
    isRequested: user.followRequests.includes(viewerId)
});

export const suggestedUsers = async (req, res) => {
    try {
        const userId = req.id;
        const me = await User.findById(userId).select('following');

        if (!me) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // don't suggest yourself and people you already follow
        const excludeIds = [userId, ...me.following.map((id) => id.toString())];

        // 1. friends of friends -> people followed by the people you follow
        const friends = await User.find({ _id: { $in: me.following } }).select('username following');
        const followedBy = {}; // suggested user id -> usernames of your friends who follow that user
        friends.forEach((friend) => {
            friend.following.forEach((id) => {
                const key = id.toString();
                if (excludeIds.includes(key)) return;
                if (!followedBy[key]) followedBy[key] = [];
                followedBy[key].push(friend.username);
            });
        });

        // most mutual friends first
        const friendOfFriendIds = Object.keys(followedBy)
            .sort((a, b) => followedBy[b].length - followedBy[a].length)
            .slice(0, 10);

        const friendsOfFriends = await User.find({ _id: { $in: friendOfFriendIds } }).select(LIST_FIELDS);
        // keep the "most mutual friends first" order
        friendsOfFriends.sort((a, b) => friendOfFriendIds.indexOf(a._id.toString()) - friendOfFriendIds.indexOf(b._id.toString()));

        // 2. less than 10 -> fill with newest users
        let newUsers = [];
        if (friendsOfFriends.length < 10) {
            newUsers = await User.find({ _id: { $nin: [...excludeIds, ...friendOfFriendIds] } })
                .sort({ createdAt: -1 })
                .limit(10 - friendsOfFriends.length)
                .select(LIST_FIELDS);
        }

        const users = [...friendsOfFriends, ...newUsers].map((user) => ({
            ...toListUser(user, userId),
            followedBy: followedBy[user._id.toString()] || []
        }));

        return res.status(200).json({
            message: "Suggested users retrieved successfully",
            users,
            success: true
        });

    } catch (error) {
        console.error("Error retrieving suggested users:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}


export const followOrUnfollow = async (req, res) => {
    try {
        const userId = req.id;
        const  targetUserId  = req.params.id;

        if(userId === targetUserId) {
            return res.status(400).json({
                message: "You cannot follow or unfollow yourself",
                success: false
            });
        }


        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
                success: false
            });
        }

        if (!targetUserId) {
            return res.status(400).json({
                message: "Target user ID is required",
                success: false
            });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        let status = "none";
        let message = "";

        if (user.following.includes(targetUserId)) {
            // Unfollow the user
            user.following.pull(targetUserId);
            targetUser.followers.pull(userId);
            message = "Unfollowed successfully";
        } else if (targetUser.followRequests.includes(userId)) {
            // Cancel the follow request
            targetUser.followRequests.pull(userId);
            message = "Follow request cancelled";
        } else if (targetUser.isPrivate) {
            // Private account -> send follow request
            targetUser.followRequests.push(userId);
            status = "requested";
            message = "Follow request sent";
        } else {
            // Follow the user
            user.following.push(targetUserId);
            targetUser.followers.push(userId);
            status = "following";
            message = "Followed successfully";
        }

        await user.save();
        await targetUser.save();

        if (status === "requested") {
            // saved in db, so the user gets it even if offline
            await createNotification({
                receiver: targetUserId,
                sender: userId,
                type: 'followRequest',
                message: 'requested to follow you'
            });
        } else if (message === "Follow request cancelled") {
            await Notification.deleteOne({ type: 'followRequest', sender: userId, receiver: targetUserId });
            sendNotification(targetUserId, {
                type: 'requestCancelled',
                userId
            });
        }

        return res.status(200).json({
            message,
            status,
            success: true,
            user: {
                following: user.following,
                followers: targetUser.followers
            }
        });
    }

    catch (error) {
        console.error("Error following or unfollowing user:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

// search all users by username -> /user/search?q=rah
export const searchUsers = async (req, res) => {
    try {
        const userId = req.id;
        const query = (req.query.q || '').trim();

        if (!query) {
            return res.status(200).json({
                users: [],
                success: true
            });
        }

        // escape special characters (. * + ? etc.) so they are searched as normal text
        const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const me = await User.findById(userId).select('following');
        const followingIds = me ? me.following.map((id) => id.toString()) : [];

        // username containing the search text anywhere (mo -> mohit, hit -> mohit)
        // people you follow are also shown (only suggestions hide them)
        const users = await User.find({
            _id: { $ne: userId },
            username: { $regex: safeQuery, $options: 'i' }
        }).select(LIST_FIELDS).limit(20);

        // order: people you follow first, then usernames starting with the search text
        const lowerQuery = query.toLowerCase();
        const score = (user) =>
            (user.isFollowing ? 2 : 0) + (user.username.toLowerCase().startsWith(lowerQuery) ? 1 : 0);

        const result = users
            .map((user) => ({
                ...toListUser(user, userId),
                isFollowing: followingIds.includes(user._id.toString())
            }))
            .sort((a, b) => score(b) - score(a));

        return res.status(200).json({
            users: result,
            success: true
        });
    }
    catch (error) {
        console.error("Error searching users:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

// people to share a post with -> people you follow + your followers (without duplicates)
export const getShareList = async (req, res) => {
    try {
        const user = await User.findById(req.id)
            .populate({ path: 'following', select: 'username profilePicture' })
            .populate({ path: 'followers', select: 'username profilePicture' });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        const users = [...user.following];
        user.followers.forEach((follower) => {
            const alreadyAdded = users.some((u) => u._id.toString() === follower._id.toString());
            if (!alreadyAdded) {
                users.push(follower);
            }
        });

        return res.status(200).json({
            users,
            success: true
        });
    }
    catch (error) {
        console.error("Error getting share list:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const getFollowRequests = async (req, res) => {
    try {
        const user = await User.findById(req.id).populate({ path: 'followRequests', select: 'username profilePicture' });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            requests: user.followRequests,
            success: true
        });
    }
    catch (error) {
        console.error("Error getting follow requests:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const acceptFollowRequest = async (req, res) => {
    try {
        const userId = req.id;
        const requesterId = req.params.id;

        const user = await User.findById(userId);
        const requester = await User.findById(requesterId);

        if (!user || !requester) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (!user.followRequests.includes(requesterId)) {
            return res.status(400).json({
                message: "No follow request from this user",
                success: false
            });
        }

        user.followRequests.pull(requesterId);
        user.followers.addToSet(requesterId);
        requester.following.addToSet(userId);

        await user.save();
        await requester.save();

        // request is answered -> remove its notification
        await Notification.deleteOne({ type: 'followRequest', sender: requesterId, receiver: userId });

        await createNotification({
            receiver: requesterId,
            sender: userId,
            type: 'requestAccepted',
            message: 'accepted your follow request'
        });

        return res.status(200).json({
            message: "Follow request accepted",
            success: true
        });
    }
    catch (error) {
        console.error("Error accepting follow request:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const rejectFollowRequest = async (req, res) => {
    try {
        const userId = req.id;
        const requesterId = req.params.id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        user.followRequests.pull(requesterId);
        await user.save();

        // request is answered -> remove its notification
        await Notification.deleteOne({ type: 'followRequest', sender: requesterId, receiver: userId });

        return res.status(200).json({
            message: "Follow request deleted",
            success: true
        });
    }
    catch (error) {
        console.error("Error rejecting follow request:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const togglePrivacy = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        user.isPrivate = !user.isPrivate;

        // account became public -> accept all pending follow requests
        if (!user.isPrivate && user.followRequests.length > 0) {
            await User.updateMany(
                { _id: { $in: user.followRequests } },
                { $addToSet: { following: user._id } }
            );

            for (const requesterId of user.followRequests) {
                user.followers.addToSet(requesterId);
                await createNotification({
                    receiver: requesterId,
                    sender: userId,
                    type: 'requestAccepted',
                    message: 'accepted your follow request'
                });
            }

            user.followRequests = [];
            await Notification.deleteMany({ type: 'followRequest', receiver: userId });
        }

        await user.save();

        return res.status(200).json({
            message: user.isPrivate ? "Your account is now private" : "Your account is now public",
            isPrivate: user.isPrivate,
            followers: user.followers,
            success: true
        });
    }
    catch (error) {
        console.error("Error changing account privacy:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}



