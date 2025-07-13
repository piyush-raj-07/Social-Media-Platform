"use client"

import React, { useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import axios from "axios"
import { toast } from "sonner"
import { setAuthUser } from "@/redux/authSlice"

const SuggestedUsers = () => {
  const { suggestedUsers, user } = useSelector((store) => store.auth)
  const [followingStates, setFollowingStates] = useState({})
  const [loadingStates, setLoadingStates] = useState({})
  const [showAll, setShowAll] = useState(false) // New state for "See All"
  const dispatch = useDispatch()

  const followUnfollowHandler = useCallback(
    async (targetUserId) => {
      if (loadingStates[targetUserId]) return

      const wasFollowing = followingStates[targetUserId] ?? user.following.includes(targetUserId)

      try {
        // Instant UI update (optimistic)
        setFollowingStates((prev) => ({
          ...prev,
          [targetUserId]: !wasFollowing,
        }))
        setLoadingStates((prev) => ({ ...prev, [targetUserId]: true }))

        const res = await axios.post(
          `http://localhost:8000/api/v1/user/followorunfollow/${targetUserId}`,
          {},
          { withCredentials: true },
        )

        if (res.data.success) {
          // Update user's following list in Redux
          const updatedUser = {
            ...user,
            following: wasFollowing
              ? user.following.filter((id) => id !== targetUserId)
              : [...user.following, targetUserId],
          }
          dispatch(setAuthUser(updatedUser))

          toast.success(res.data.message)
        } else {
          // Revert optimistic update on failure
          setFollowingStates((prev) => ({
            ...prev,
            [targetUserId]: wasFollowing,
          }))
          toast.error("Failed to follow/unfollow")
        }
      } catch (error) {
        console.log(error)
        toast.error(error.response?.data?.message || "Failed to follow/unfollow")

        // Revert optimistic update on error
        setFollowingStates((prev) => ({
          ...prev,
          [targetUserId]: wasFollowing,
        }))
      } finally {
        setLoadingStates((prev) => ({ ...prev, [targetUserId]: false }))
      }
    },
    [followingStates, loadingStates, user, dispatch],
  )

  if (!suggestedUsers || suggestedUsers.length === 0) {
    return null
  }

  const usersToDisplay = showAll ? suggestedUsers : suggestedUsers.slice(0, 5)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-lg text-gray-900">Suggested for you</h2>
        {suggestedUsers.length > 5 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:tracking-wide cursor-pointer "
          >
            See All
          </button>
        )}
        {showAll && (
          <button
            onClick={() => setShowAll(false)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Show Less
          </button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {usersToDisplay.map((suggestedUser, index) => {
            const isFollowing = followingStates[suggestedUser._id] ?? user.following.includes(suggestedUser._id)
            const isLoading = loadingStates[suggestedUser._id]

            return (
              <motion.div
                key={suggestedUser?._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ backgroundColor: "#f9fafb", scale: 1.02 }}
                className="flex items-center justify-between p-3 rounded-xl transition-all duration-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Link to={`/profile/${suggestedUser?._id}`}>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Avatar className="w-12 h-12 ring-2 ring-gray-100">
                        <AvatarImage src={suggestedUser?.profilePicture || "/placeholder.svg"} alt="profile" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                          {suggestedUser?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      <Link to={`/profile/${suggestedUser?._id}`} className="hover:text-gray-700 transition-colors">
                        {suggestedUser?.username}
                      </Link>
                    </h3>
                    <p className="text-gray-500 text-xs truncate">{suggestedUser?.bio || "New to the platform"}</p>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => followUnfollowHandler(suggestedUser._id)}
                    disabled={isLoading}
                    size="sm"
                    className={`text-xs px-4 py-2 h-8 rounded-lg font-medium transition-all ${
                      isFollowing
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : isFollowing ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default React.memo(SuggestedUsers)
