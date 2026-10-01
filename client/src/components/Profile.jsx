"use client"

import React, { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import useGetUserProfile from "@/hooks/useGetUserProfile"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { setSelectedUser, setAuthUser, setUserProfile } from "@/redux/authSlice"
import axios from "axios"
import { API_URL } from "@/lib/config"
import { toast } from "sonner"
import { Settings, UserMinus, UserPlus, MessageCircle, AtSign, Heart, Lock, Clock } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import CommentDialog from "./CommentDialog"
import { setSelectedPost } from "@/redux/postSlice"

const Profile = () => {
  const params = useParams()
  const navigate = useNavigate()
  const userId = params.id
  const dispatch = useDispatch()
  useGetUserProfile(userId)

  const [activeTab, setActiveTab] = useState("posts")
  const [isLoading, setIsLoading] = useState(false)
  const [commentOpen, setCommentOpen] = useState(false)

  const { userProfile, user } = useSelector((store) => store.auth)

  const isLoggedInUserProfile = user?.id === userProfile?._id
  const isFollowing = userProfile?.followStatus === "following"
  const isRequested = userProfile?.followStatus === "requested"
  const followsYou = userProfile?.following?.includes(user?.id) || false
  const followersCount = userProfile?.followers?.length || 0

  // go back to posts tab when opening another profile
  useEffect(() => {
    setActiveTab("posts")
  }, [userId])

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
  }, [])

  // open the post with its comments
  const openPostHandler = useCallback((post) => {
    dispatch(setSelectedPost(post))
    setCommentOpen(true)
  }, [dispatch])

  const handleMessageClick = useCallback(() => {
    dispatch(setSelectedUser(userProfile))
    navigate("/chat")
  }, [userProfile, dispatch, navigate])

  const followUnfollowHandler = useCallback(async () => {
    if (isLoading || isLoggedInUserProfile) return

    try {
      setIsLoading(true)

      const res = await axios.post(
        `${API_URL}/user/followorunfollow/${userProfile._id}`,
        {},
        { withCredentials: true },
      )

      if (res.data.success) {
        // status can be "following", "requested" or "none"
        const status = res.data.status

        // Update the current user's following list
        const updatedUser = {
          ...user,
          following: status === "following"
            ? [...user.following, userProfile._id]
            : user.following.filter((id) => id !== userProfile._id),
        }
        dispatch(setAuthUser(updatedUser))

        // Update the userProfile's followers list
        const updatedUserProfile = {
          ...userProfile,
          followStatus: status,
          followers: status === "following"
            ? [...userProfile.followers, user.id]
            : userProfile.followers.filter((id) => id !== user.id),
        }

        // unfollowed a private account -> hide the posts again
        if (userProfile.isPrivate && status !== "following") {
          updatedUserProfile.isLocked = true
          updatedUserProfile.posts = []
        }

        dispatch(setUserProfile(updatedUserProfile))

        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to follow/unfollow")
    } finally {
      setIsLoading(false)
    }
  }, [userProfile?._id, user, dispatch, isLoading, isLoggedInUserProfile, userProfile])

  const displayedPost = activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks

  // saved tab is only for your own profile
  const tabs = isLoggedInUserProfile ? ["posts", "saved"] : ["posts"]

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50">
      <div className="w-full">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Avatar Section */}
              <div className="flex justify-center md:justify-start">
                <motion.div whileHover={{ scale: 1.05 }} className="relative">
                  <Avatar className="w-32 h-32 sm:w-40 sm:h-40 ring-4 ring-gray-100 shadow-lg">
                    <AvatarImage src={userProfile?.profilePicture || "/placeholder.svg"} alt="profile" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-4xl">
                      {userProfile?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </div>

              {/* Profile Info */}
              <div className="md:col-span-2 text-center md:text-left space-y-6">
                {/* Username and Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-gray-900">
                    {userProfile?.username}
                    {userProfile?.isPrivate && <Lock className="w-5 h-5 text-gray-500" />}
                  </h1>

                  <div className="flex gap-3">
                    {isLoggedInUserProfile ? (
                      <>
                        <Link to="/account/edit">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" className="h-10 px-6 rounded-xl border-gray-300 bg-transparent">
                              <Settings className="w-4 h-4 mr-2" />
                              Edit Profile
                            </Button>
                          </motion.div>
                        </Link>
                      </>
                    ) : (
                      <>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={followUnfollowHandler}
                            disabled={isLoading}
                            className={`h-10 px-6 rounded-xl font-medium transition-all ${
                              isFollowing || isRequested
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            }`}
                          >
                            {isLoading ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            ) : isFollowing ? (
                              <>
                                <UserMinus className="w-4 h-4 mr-2" />
                                Following
                              </>
                            ) : isRequested ? (
                              <>
                                <Clock className="w-4 h-4 mr-2" />
                                Requested
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                {followsYou ? "Follow Back" : "Follow"}
                              </>
                            )}
                          </Button>
                        </motion.div>
                        <Button
                          onClick={handleMessageClick}
                          variant="outline"
                          className="h-10 px-6 rounded-xl border-gray-300 bg-transparent"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center md:justify-start gap-8">
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{userProfile?.postsCount || 0}</p>
                    <p className="text-gray-600 text-sm">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{followersCount}</p>
                    <p className="text-gray-600 text-sm">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{userProfile?.following?.length || 0}</p>
                    <p className="text-gray-600 text-sm">Following</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-3">
                  <p className="text-gray-700 font-medium">{userProfile?.bio || "No bio available"}</p>
                  <Badge className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-200" variant="secondary">
                    <AtSign className="w-3 h-3 mr-1" />
                    {userProfile?.username}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Private account locked box */}
          {userProfile?.isLocked ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 text-center py-16 px-6">
              <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">This account is private</h3>
              <p className="text-gray-500">Follow this account to see their posts.</p>
            </div>
          ) : (
          <>
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="border-b border-gray-200">
              <div className="flex justify-center">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ backgroundColor: "#f3f4f6" }}
                    onClick={() => handleTabChange(tab)}
                    className={`px-8 py-4 text-sm font-medium uppercase tracking-wide transition-colors ${
                      activeTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Posts Grid */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {displayedPost && displayedPost.length > 0 ? (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {displayedPost.map((post, index) => (
                      <motion.div
                        key={post?._id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => openPostHandler(post)}
                        className="relative group cursor-pointer rounded-xl overflow-hidden bg-gray-100 aspect-square"
                      >
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt="post"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity"
                        >
                          <div className="flex items-center text-white space-x-6">
                            <div className="flex items-center gap-2">
                              <Heart className="w-6 h-6" />
                              <span className="font-semibold">{post?.likes?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-6 h-6" />
                              <span className="font-semibold">{post?.comments?.length || 0}</span>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                  >
                    <div className="text-gray-400 mb-4">
                      <Heart className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No {activeTab} yet</h3>
                    <p className="text-gray-500">
                      {activeTab === "posts" ? "Share your first post!" : "Save posts you love!"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          </>
          )}
        </div>
      </div>

      <CommentDialog open={commentOpen} setOpen={setCommentOpen} />
    </motion.div>
  )
}

export default React.memo(Profile)