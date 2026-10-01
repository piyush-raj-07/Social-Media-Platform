import { setFollowRequests } from "@/redux/notificationSlice";
import axios from "axios";
import { API_URL } from "@/lib/config";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetFollowRequests = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchFollowRequests = async () => {
            try {
                const res = await axios.get(`${API_URL}/user/requests`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setFollowRequests(res.data.requests));
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchFollowRequests();
    }, []);
};

export default useGetFollowRequests;
