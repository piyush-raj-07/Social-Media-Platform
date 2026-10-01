import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        
    },
    message: {
        type: String,
        default: ''         // can be empty when only a post is shared
    },
    type: {
        type: String,
        enum: ['text', 'post'],
        default: 'text'
    },
    sharedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;