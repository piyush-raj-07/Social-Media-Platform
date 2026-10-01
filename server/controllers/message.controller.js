import Conversation from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import Message from "../models/message.model.js"
import Post from "../models/post.model.js";
import canViewPosts from "../utils/canViewPosts.js";
import { createNotification } from "../utils/notification.js";

// details of shared post which are shown in chat
const sharedPostPopulate = {
    path: 'sharedPost',
    select: 'image caption author',
    populate: { path: 'author', select: 'username profilePicture' }
};

// for chatting
export const sendMessage = async (req,res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {textMessage:message, postId} = req.body;

        if(!message?.trim() && !postId) return res.status(400).json({message:'Message is empty', success:false});

        // sharing a post -> check post exists and sender is allowed to see it
        let post = null;
        if(postId){
            post = await Post.findById(postId);
            if(!post) return res.status(404).json({message:'Post not found', success:false});

            const canView = await canViewPosts(senderId, post.author);
            if(!canView) return res.status(403).json({message:'This account is private', success:false});
        }

        let conversation = await Conversation.findOne({
            participants:{$all:[senderId, receiverId]}
        });
        // establish the conversation if not started yet.
        if(!conversation){
            conversation = await Conversation.create({
                participants:[senderId, receiverId]
            })
        };
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,
            type: postId ? 'post' : 'text',
            sharedPost: postId
        });
        if(newMessage) conversation.messages.push(newMessage._id);

        await Promise.all([conversation.save(),newMessage.save()])

        await newMessage.populate(sharedPostPopulate);

        // receiver may not be allowed to see the post (private account the receiver doesn't follow)
        const messageForReceiver = newMessage.toObject();
        let receiverCanView = true;
        if(post){
            receiverCanView = await canViewPosts(receiverId, post.author);
            if(!receiverCanView) messageForReceiver.sharedPost = null;
        }

        // implement socket io for real time data transfer
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage', messageForReceiver);
        }

        if(post){
            await createNotification({
                receiver: receiverId,
                sender: senderId,
                type: 'share',
                post: receiverCanView ? postId : undefined,
                message: 'sent you a post'
            });
        }

        return res.status(201).json({
            success:true,
            newMessage
        })
    } catch (error) {
        console.log(error);
    }
}
// people you have chatted with (newest chat first) with their last message
export const getConversations = async (req,res) => {
    try {
        const userId = req.id;
        const conversations = await Conversation.find({ participants: userId })
            .sort({ updatedAt: -1 })
            .populate({ path: 'participants', select: 'username profilePicture' })
            .populate({ path: 'messages', options: { sort: { createdAt: -1 } }, perDocumentLimit: 1 });

        const chats = conversations.map((conversation) => {
            const otherUser = conversation.participants.find((p) => p._id.toString() !== userId);
            const lastMessage = conversation.messages[0];

            let lastMessageText = '';
            if(lastMessage){
                const text = lastMessage.type === 'post' ? 'sent a post' : lastMessage.message;
                lastMessageText = lastMessage.senderId.toString() === userId ? `You: ${text}` : text;
            }

            return {
                _id: otherUser?._id,
                username: otherUser?.username,
                profilePicture: otherUser?.profilePicture,
                lastMessage: lastMessageText,
                lastMessageTime: conversation.updatedAt
            };
        }).filter((chat) => chat._id);

        return res.status(200).json({success:true, chats});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Internal server error', success:false});
    }
}

export const getMessage = async (req,res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const conversation = await Conversation.findOne({
            participants:{$all: [senderId, receiverId]}
        }).populate({ path: 'messages', populate: sharedPostPopulate });
        if(!conversation) return res.status(200).json({success:true, messages:[]});

        // hide shared posts which this user is not allowed to see (private account)
        const messages = await Promise.all(conversation.messages.map(async (msg) => {
            const obj = msg.toObject();
            if(obj.sharedPost){
                const canView = obj.sharedPost.author && await canViewPosts(senderId, obj.sharedPost.author._id);
                if(!canView) obj.sharedPost = null;
            }
            return obj;
        }));

        return res.status(200).json({success:true, messages});
        
    } catch (error) {
        console.log(error);
    }
}