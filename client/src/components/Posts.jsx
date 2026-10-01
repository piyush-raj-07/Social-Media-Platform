"use client"

import React, { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2 } from "lucide-react"
import Post from "./Post"
import { useSelector } from "react-redux"
import useGetAllPosts from "@/hooks/useGetAllPosts"

const PostItem = ({ post }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    transition={{ duration: 0.4 }}
  >
    <Post post={post} />
  </motion.div>
)

const Posts = () => {
  const { posts, hasMore, feedType } = useSelector((store) => store.post)
  const { loading, loadMore } = useGetAllPosts()
  const bottomRef = useRef(null)

  // when the end of the feed comes on screen -> load next 20 posts
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: "400px" }, // start loading a little before the real end
    )
    if (bottomRef.current) observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  const followingPosts = posts.filter((post) => !post.isSuggested)
  const suggestedPosts = posts.filter((post) => post.isSuggested)
  const followingDone = feedType === "suggested" || !hasMore // seen all posts of people you follow
  const allDone = feedType === "suggested" && !hasMore // nothing more to load

  // nothing at all
  if (allDone && posts.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
          <p className="text-gray-500">Start sharing your moments with the world!</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Posts of people you follow (and your own) */}
      <AnimatePresence mode="popLayout">
        {followingPosts.map((post) => (
          <PostItem key={post._id} post={post} />
        ))}
      </AnimatePresence>

      {/* Seen everything from people you follow */}
      {followingDone && (
        <div className="flex flex-col items-center text-center py-8 border-t border-gray-200">
          <div className="w-14 h-14 rounded-full border-2 border-purple-500 flex items-center justify-center mb-3">
            <Check className="w-7 h-7 text-purple-500" />
          </div>
          <h3 className="font-semibold text-gray-900">You're all caught up</h3>
          <p className="text-sm text-gray-500">You've seen all posts from people you follow</p>
          {suggestedPosts.length > 0 && <h4 className="mt-8 font-semibold text-gray-900 self-start">Suggested posts</h4>}
        </div>
      )}

      {/* Posts of other public accounts */}
      <AnimatePresence mode="popLayout">
        {suggestedPosts.map((post) => (
          <PostItem key={post._id} post={post} />
        ))}
      </AnimatePresence>

      {/* when this comes on screen, next posts are loaded */}
      <div ref={bottomRef} className="flex justify-center py-6">
        {loading && <Loader2 className="w-6 h-6 animate-spin text-gray-400" />}
        {allDone && posts.length > 0 && <p className="text-sm text-gray-400">No more posts</p>}
      </div>
    </motion.div>
  )
}

export default React.memo(Posts)
