import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.id })
            .sort({ createdAt: -1 })
            .limit(30)
            .populate({ path: 'sender', select: 'username profilePicture' })
            .populate({ path: 'post', select: 'image' });

        return res.status(200).json({
            notifications,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export const markNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany({ receiver: req.id, read: false }, { read: true });

        return res.status(200).json({
            message: "Notifications marked as read",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}
