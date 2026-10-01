import { setNotifications } from "@/redux/notificationSlice";
import axios from "axios";
import { API_URL } from "@/lib/config";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

// loads saved notifications when app opens (so notifications are not lost when user was offline)
const useGetNotifications = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`${API_URL}/notification/all`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setNotifications(res.data.notifications));

                    const unreadCount = res.data.notifications.filter((n) => !n.read).length;
                    if (unreadCount > 0) {
                        // same id -> toast is shown only once
                        toast(`You have ${unreadCount} new notification${unreadCount > 1 ? "s" : ""}`, { id: "unread-notifications" });
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchNotifications();
    }, []);
};

export default useGetNotifications;
