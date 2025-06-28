import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cloudinary from '../utils/cloudinary.js';
import getDataUri from '../utils/datauri.js';
import User from '../models/user.model.js';




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

       const populatePosts = await Promise.all(
    Array.isArray(user.post) ? user.post.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post?.author?.equals(user._id)) {
            return post;
        }
        return null;
    }) : []
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
                post: populatePosts,
                followers: user.followers || [],
                following: user.following || []

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
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        return res.status(200).json({
            message: "User profile retrieved successfully",
            user,
            success: true,
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

export const suggestedUsers = async (req, res) => {
    try {
       const suggestedUsers = await User.find({_id:{
        $ne: req.id
       }}).select("-password").limit(10);

        if (suggestedUsers.length === 0) {
            return res.status(404).json({
                message: "No suggested users found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Suggested users retrieved successfully",
            users: suggestedUsers,
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

        if (user.following.includes(targetUserId)) {
            // Unfollow the user
            user.following.pull(targetUserId);
            targetUser.followers.pull(userId);
        } else {
            // Follow the user
            user.following.push(targetUserId);
            targetUser.followers.push(userId);
        }

        await user.save();
        await targetUser.save();

        return res.status(200).json({
            message: user.following.includes(targetUserId) ? "Followed successfully" : "Unfollowed successfully",
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



