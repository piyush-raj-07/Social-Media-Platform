import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        followRequests: [],
        notifications: [],
    },
    reducers: {
        // actions
        setFollowRequests: (state, action) => {
            state.followRequests = action.payload;
        },
        setNotifications: (state, action) => {
            state.notifications = action.payload;
        }
    }
});
export const { setFollowRequests, setNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
