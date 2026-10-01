import React, { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'
import { Loader2, MessageCircle, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import Comment from './Comment'
import axios from 'axios'
import { API_URL } from '@/lib/config'
import { toast } from 'sonner'
import { setPosts } from '@/redux/postSlice'
import { setUserProfile } from '@/redux/authSlice'

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const [comment, setComment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  // comments load 20 at a time (newest first)
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { selectedPost, posts } = useSelector(store => store.post);
  const { user, userProfile } = useSelector(store => store.auth);
  const listRef = useRef(null);
  const dispatch = useDispatch();

  const fetchComments = async (cursorValue) => {
    const res = await axios.post(`${API_URL}/post/${selectedPost._id}/comment/all`, {}, {
      params: { cursor: cursorValue },
      withCredentials: true
    });
    return res.data;
  }

  // load first 20 comments when dialog opens (works for feed and profile posts)
  useEffect(() => {
    if (!open || !selectedPost) return;

    const loadFirstComments = async () => {
      try {
        setLoading(true);
        setComment([]);
        const data = await fetchComments(null);
        if (data.success) {
          setComment(data.comments);
          setCursor(data.nextCursor);
          setHasMore(data.hasMore);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    loadFirstComments();
  }, [open, selectedPost?._id]);

  // next 20 older comments
  const loadMoreComments = async () => {
    if (loadingMore) return;
    try {
      setLoadingMore(true);
      const data = await fetchComments(cursor);
      if (data.success) {
        setComment((prev) => [...prev, ...data.comments]);
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingMore(false);
    }
  }

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  }

  const sendMessageHandler = async () => {
    if (!text.trim() || sending) return;

    try {
      setSending(true);
      const res = await axios.post(`${API_URL}/post/${selectedPost?._id}/comment`, { text }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (res.data.success) {
        // newest first -> new comment goes on top
        setComment([res.data.comment, ...comment]);
        listRef.current?.scrollTo({ top: 0, behavior: "smooth" });

        // add comment id to this post (so comment count updates)
        const addComment = (list) => list?.map(p =>
          p._id === selectedPost._id ? { ...p, comments: [...p.comments, res.data.comment._id] } : p
        );

        // update comment count in feed
        dispatch(setPosts(addComment(posts)));

        // update comment count in profile grid
        if (userProfile) {
          dispatch(setUserProfile({
            ...userProfile,
            posts: addComment(userProfile.posts),
            bookmarks: addComment(userProfile.bookmarks)
          }));
        }

        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 gap-0 overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className='flex h-[80vh] max-h-[640px]'>
          {/* Post image (hidden on small screens) */}
          <div className='hidden md:flex md:w-1/2 bg-black items-center justify-center'>
            <img
              src={selectedPost?.image}
              alt="post_img"
              className='w-full h-full object-contain'
            />
          </div>

          <div className='flex flex-col flex-1 min-w-0 md:w-1/2'>
            {/* Header */}
            <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100'>
              <Link
                to={`/profile/${selectedPost?.author?._id}`}
                onClick={() => setOpen(false)}
                className='flex gap-3 items-center'
              >
                <Avatar className="w-9 h-9 ring-2 ring-gray-100">
                  <AvatarImage src={selectedPost?.author?.profilePicture} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-sm">
                    {selectedPost?.author?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className='font-semibold text-sm text-gray-900 hover:text-gray-600 transition-colors'>
                  {selectedPost?.author?.username}
                </span>
              </Link>
              <button onClick={() => setOpen(false)} className='p-2 rounded-full hover:bg-gray-100 transition-colors'>
                <X className='w-5 h-5 text-gray-600' />
              </button>
            </div>

            {/* Caption + comments */}
            <div ref={listRef} className='flex-1 overflow-y-auto px-4 py-4 space-y-5'>
              {selectedPost?.caption && (
                <div className='flex gap-3 items-start pb-4 border-b border-gray-100'>
                  <Link to={`/profile/${selectedPost?.author?._id}`} onClick={() => setOpen(false)} className='shrink-0'>
                    <Avatar className="w-8 h-8 ring-2 ring-gray-100">
                      <AvatarImage src={selectedPost?.author?.profilePicture} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-xs">
                        {selectedPost?.author?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <p className='text-sm text-gray-700 leading-relaxed break-words'>
                    <Link
                      to={`/profile/${selectedPost?.author?._id}`}
                      onClick={() => setOpen(false)}
                      className='font-semibold text-gray-900 mr-2 hover:text-gray-600'
                    >
                      {selectedPost?.author?.username}
                    </Link>
                    {selectedPost?.caption}
                  </p>
                </div>
              )}

              {loading ? (
                <div className='flex justify-center py-10'>
                  <Loader2 className='w-6 h-6 animate-spin text-gray-400' />
                </div>
              ) : comment.length === 0 ? (
                <div className='text-center py-10'>
                  <MessageCircle className='w-10 h-10 mx-auto text-gray-300 mb-2' />
                  <p className='font-semibold text-gray-800'>No comments yet</p>
                  <p className='text-sm text-gray-500'>Start the conversation.</p>
                </div>
              ) : (
                comment.map((c) => <Comment key={c._id} comment={c} onUserClick={() => setOpen(false)} />)
              )}

              {/* older comments */}
              {!loading && hasMore && (
                <button
                  onClick={loadMoreComments}
                  disabled={loadingMore}
                  className='w-full flex justify-center py-2 text-sm font-medium text-gray-500 hover:text-gray-800 disabled:cursor-not-allowed'
                >
                  {loadingMore ? <Loader2 className='w-5 h-5 animate-spin' /> : "View more comments"}
                </button>
              )}
            </div>

            {/* Add comment */}
            <div className='flex items-center gap-3 px-4 py-3 border-t border-gray-100'>
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-xs">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <input
                type="text"
                value={text}
                onChange={changeEventHandler}
                onKeyDown={(e) => e.key === "Enter" && sendMessageHandler()}
                placeholder='Add a comment...'
                className='flex-1 min-w-0 outline-none text-sm px-4 py-2 rounded-full bg-gray-100 border border-transparent focus:bg-white focus:border-gray-300 transition-all'
              />
              <button
                disabled={!text.trim() || sending}
                onClick={sendMessageHandler}
                className='text-blue-600 font-semibold text-sm hover:text-blue-800 disabled:text-blue-300 disabled:cursor-not-allowed transition-colors'
              >
                {sending ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CommentDialog
