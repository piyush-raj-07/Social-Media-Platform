import { appendPosts, setFeedInfo, setPosts } from "@/redux/postSlice";
import axios from "axios";
import { API_URL } from "@/lib/config";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// feed: 20 posts at a time
// first posts of people you follow, then suggested posts of other public accounts
const useGetAllPosts = () => {
    const dispatch = useDispatch();
    const { cursor, hasMore, feedType } = useSelector(store => store.post);
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(false); // stops loading the same page twice

    const fetchPosts = async (type, cursorValue) => {
        const res = await axios.get(`${API_URL}/post/all`, {
            params: { type, cursor: cursorValue },
            withCredentials: true
        });
        return res.data;
    }

    // first 20 posts when feed opens
    useEffect(() => {
        const loadFirstPage = async () => {
            try {
                loadingRef.current = true;
                setLoading(true);
                const data = await fetchPosts("following", null);
                if (data.success) {
                    dispatch(setPosts(data.posts));
                    dispatch(setFeedInfo({ cursor: data.nextCursor, hasMore: data.hasMore, feedType: "following" }));
                }
            } catch (error) {
                console.log(error);
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
        }
        loadFirstPage();
    }, []);

    // next 20 posts (called when user reaches the end of the feed)
    const loadMore = async () => {
        if (loadingRef.current) return;
        if (feedType === "suggested" && !hasMore) return; // nothing left

        // following posts finished -> start suggested posts from the beginning
        const type = hasMore ? feedType : "suggested";
        const cursorValue = hasMore ? cursor : null;

        try {
            loadingRef.current = true;
            setLoading(true);
            const data = await fetchPosts(type, cursorValue);
            if (data.success) {
                // mark suggested posts so feed can show them in their own section
                const newPosts = type === "suggested"
                    ? data.posts.map((post) => ({ ...post, isSuggested: true }))
                    : data.posts;
                dispatch(appendPosts(newPosts));
                dispatch(setFeedInfo({ cursor: data.nextCursor, hasMore: data.hasMore, feedType: type }));
            }
        } catch (error) {
            console.log(error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }

    return { loading, loadMore };
};

export default useGetAllPosts;
