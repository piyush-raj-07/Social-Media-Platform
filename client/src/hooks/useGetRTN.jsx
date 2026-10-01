import { setAuthUser } from "@/redux/authSlice";
import { setFollowRequests, setNotifications } from "@/redux/notificationSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

// real time notifications
const useGetRTN = () => {
    const dispatch = useDispatch();
    const { socket } = useSelector(store => store.socketio);
    const { user } = useSelector(store => store.auth);
    const { followRequests, notifications } = useSelector(store => store.notification);

    useEffect(() => {
        socket?.on('notification', (notification) => {
            if (notification.type === 'followRequest') {
                dispatch(setFollowRequests([notification.sender, ...followRequests]));
                dispatch(setNotifications([notification, ...notifications]));
                toast(`${notification.sender.username} ${notification.message}`);
            } else if (notification.type === 'requestCancelled') {
                dispatch(setFollowRequests(followRequests.filter((req) => req._id !== notification.userId)));
                // remove its notification too
                dispatch(setNotifications(notifications.filter((n) => !(n.type === 'followRequest' && n.sender?._id === notification.userId))));
            } else if (notification.type === 'requestAccepted') {
                dispatch(setAuthUser({ ...user, following: [...user.following, notification.sender._id] }));
                dispatch(setNotifications([notification, ...notifications]));
                toast.success(`${notification.sender.username} ${notification.message}`);
            } else if (notification.type === 'like' || notification.type === 'comment' || notification.type === 'share') {
                dispatch(setNotifications([notification, ...notifications]));
                toast(`${notification.sender.username} ${notification.message}`);
            }
        });

        return () => {
            socket?.off('notification');
        }
    }, [socket, followRequests, notifications, user, dispatch]);
};
export default useGetRTN;
