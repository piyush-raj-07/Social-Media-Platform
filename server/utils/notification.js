import Notification from "../models/notification.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// send real time event to a user (only if the user is online)
export const sendNotification = (receiverId, notification) => {
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
        io.to(receiverSocketId).emit('notification', notification);
    }
}

// save notification in db (so it is not lost when user is offline) and send it if user is online
export const createNotification = async ({ receiver, sender, type, post, message }) => {
    try {
        // no notification for your own actions
        if (receiver.toString() === sender.toString()) return;

        const notification = await Notification.create({ receiver, sender, type, post, message });
        await notification.populate({ path: 'sender', select: 'username profilePicture' });
        await notification.populate({ path: 'post', select: 'image' });

        sendNotification(receiver, notification);
    } catch (error) {
        console.log(error);
    }
}
