import { setMessages } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetRTM = () => {
    const dispatch = useDispatch();
    const { socket } = useSelector(store => store.socketio);
    const { messages } = useSelector(store => store.chat);
    const { selectedUser } = useSelector(store => store.auth);
    useEffect(() => {
        socket?.on('newMessage', (newMessage) => {
            // only add the message if it is from the person whose chat is open
            if (newMessage.senderId === selectedUser?._id) {
                dispatch(setMessages([...messages, newMessage]));
            }
        })

        return () => {
            socket?.off('newMessage');
        }
    }, [socket, messages, selectedUser, dispatch]);
};
export default useGetRTM;