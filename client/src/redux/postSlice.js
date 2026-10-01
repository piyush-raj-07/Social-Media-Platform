import { createSlice } from "@reduxjs/toolkit";
const postSlice = createSlice({
    name:'post',
    initialState:{
        posts:[],
        selectedPost:null,
        // feed loads 20 posts at a time
        cursor:null,            // id of last loaded post
        hasMore:true,           // more posts on server?
        feedType:'following',   // 'following' -> then 'suggested'
    },
    reducers:{
        //actionsa
        setPosts:(state,action) => {
            state.posts = action.payload;
        },
        // add next 20 posts at the end of the feed
        appendPosts:(state,action) => {
            state.posts = [...state.posts, ...action.payload];
        },
        setFeedInfo:(state,action) => {
            state.cursor = action.payload.cursor;
            state.hasMore = action.payload.hasMore;
            state.feedType = action.payload.feedType;
        },
        setSelectedPost:(state,action) => {
            state.selectedPost = action.payload;
        }
    }
});
export const {setPosts, appendPosts, setFeedInfo, setSelectedPost} = postSlice.actions;
export default postSlice.reducer;
