

import { Badge } from "@/components/ui/badge"
import React, { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react"
import { Button } from "./ui/button"
import { FaHeart, FaRegHeart } from "react-icons/fa"
import CommentDialog from "./CommentDialog"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { toast } from "sonner"
import { setPosts, setSelectedPost } from "@/redux/postSlice"

const Post = ({ post }) => {
  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)

  const { user } = useSelector((store) => store.auth)
  const { posts } = useSelector((store) => store.post)

  const [liked, setLiked] = useState(post.likes.includes(user?.id) || false)
  const [postLike, setPostLike] = useState(post.likes.length)
  const [comment, setComment] = useState(post.comments)

  const dispatch = useDispatch()

  const changeEventHandler = useCallback((e) => {
    const inputText = e.target.value
    setText(inputText.trim() ? inputText : "")
  }, [])

  const likeOrDislikeHandler = useCallback(async () => {
    if (isLiking) return

    const wasLiked = liked

    try {
      setLiked(!wasLiked)
      setPostLike((prev) => (wasLiked ? prev - 1 : prev + 1))
      setIsLiking(true)

      const action = wasLiked ? "dislike" : "like"
      const res = await axios.get(`http://localhost:8000/api/v1/post/${post._id}/${action}`, {
        withCredentials: true,
      })

      if (res.data.success) {
        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: wasLiked ? p.likes.filter((id) => id !== user.id) : [...p.likes, user.id],
              }
            : p
        )
        dispatch(setPosts(updatedPostData))
        toast.success(res.data.message)
      } else {
        setLiked(wasLiked)
        setPostLike(post.likes.length)
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to update like")
      setLiked(wasLiked)
      setPostLike(post.likes.length)
    } finally {
      setIsLiking(false)
    }
  }, [liked, post._id, posts, user.id, dispatch, isLiking])

  const commentHandler = useCallback(async () => {
    if (!text.trim() || isCommenting) return

    try {
      setIsCommenting(true)
      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${post._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment]
        setComment(updatedCommentData)
        const updatedPostData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        )
        dispatch(setPosts(updatedPostData))
        toast.success(res.data.message)
        setText("")
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to add comment")
    } finally {
      setIsCommenting(false)
    }
  }, [text, comment, post._id, posts, dispatch, isCommenting])

  const deletePostHandler = useCallback(async () => {
    try {
      const res = await axios.delete(`http://localhost:8000/api/v1/post/delete/${post?._id}`, {
        withCredentials: true,
      })
      if (res.data.success) {
        const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id)
        dispatch(setPosts(updatedPostData))
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to delete post")
    }
  }, [post._id, posts, dispatch])

  const bookmarkHandler = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/v1/post/${post?._id}/bookmark`, {
        withCredentials: true,
      })
      if (res.data.success) {
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to bookmark")
    }
  }, [post._id])

  const handleCommentClick = useCallback(() => {
    dispatch(setSelectedPost(post))
    setOpen(true)
  }, [post, dispatch])

  const isAuthor = useMemo(() => user?.id === post.author?._id, [user?.id, post.author?._id])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-8 w-full max-w-sm mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.author?.profilePicture || "/placeholder.svg"} alt="post_image" />
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
              {post.author?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-gray-900">{post.author?.username}</h1>
            {isAuthor && (
              <Badge variant="secondary" className="text-xs">
                Author
              </Badge>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <motion.button whileTap={{ scale: 0.95 }}>
              <MoreHorizontal className="cursor-pointer text-gray-600 hover:text-gray-900" />
            </motion.button>
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center">
            {!isAuthor && (
              <Button variant="ghost" className="cursor-pointer w-fit text-red-500 font-bold">
                Hello Jee
              </Button>
            )}
            {isAuthor && (
              <Button onClick={deletePostHandler} variant="ghost" className="cursor-pointer w-fit text-red-500">
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Image */}
      <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} className="relative overflow-hidden">
        <img className="w-full aspect-square object-cover" src={post.image || "/placeholder.svg"} alt="post_img" />
      </motion.div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={likeOrDislikeHandler}
              disabled={isLiking}
              className="focus:outline-none"
            >
              <AnimatePresence mode="wait">
                {liked ? (
                  <motion.div key="liked" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <FaHeart size={24} className="text-red-500" />
                  </motion.div>
                ) : (
                  <motion.div key="unliked" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <FaRegHeart size={24} className="text-gray-700 hover:text-gray-900" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button whileTap={{ scale: 0.9 }} onClick={handleCommentClick}>
              <MessageCircle className="w-6 h-6 text-gray-700 hover:text-gray-900" />
            </motion.button>

            <motion.button whileTap={{ scale: 0.9 }}>
              <Send className="w-6 h-6 text-gray-700 hover:text-gray-900" />
            </motion.button>
          </div>

          <motion.button whileTap={{ scale: 0.9 }} onClick={bookmarkHandler}>
            <Bookmark className="w-6 h-6 text-gray-700 hover:text-gray-900" />
          </motion.button>
        </div>

        <motion.span key={postLike} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-semibold text-gray-900 block mb-2">
          {postLike} likes
        </motion.span>

        <p className="text-gray-900 mb-2">
          <span className="font-semibold mr-2">{post.author?.username}</span>
          {post.caption}
        </p>

        {comment.length > 0 && (
          <motion.span
            whileHover={{ color: "#374151" }}
            onClick={handleCommentClick}
            className="cursor-pointer text-sm text-gray-500 block mb-3"
          >
            View all {comment.length} comments
          </motion.span>
        )}

        <CommentDialog open={open} setOpen={setOpen} />

        {/* Add comment */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={changeEventHandler}
            className="flex-1 outline-none text-sm text-gray-900 placeholder-gray-500"
            onKeyPress={(e) => e.key === "Enter" && commentHandler()}
          />
          {text && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={commentHandler}
              disabled={isCommenting}
              className="text-blue-500 font-semibold text-sm hover:text-blue-600 disabled:opacity-50"
            >
              {isCommenting ? "Posting..." : "Post"}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default React.memo(Post)
