"use client"

import React, { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import useGetUserProfile from "@/hooks/useGetUserProfile"
import { Link, useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { setSelectedUser, setAuthUser, setUserProfile } from "@/redux/authSlice"
import axios from "axios"
import toast from "react-hot-toast"
import { Settings, UserMinus, UserPlus, MessageCircle, AtSign, Heart } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"

const Profile = () => {
  const params = useParams()
  const navigate = useNavigate()
  const userId = params.id
  const dispatch = useDispatch()
  useGetUserProfile(userId)

  const [activeTab, setActiveTab] = useState("posts")
  const [isLoading, setIsLoading] = useState(false)

  const { userProfile, user } = useSelector((store) => store.auth)

  const isLoggedInUserProfile = user?.id === userProfile?._id
  const isFollowing = userProfile?.followers?.includes(user?.id) || false
  const followersCount = userProfile?.followers?.length || 0

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
  }, [])

  const handleMessageClick = useCallback(() => {
    dispatch(setSelectedUser(userProfile))
    navigate("/chat")
  }, [userProfile, dispatch, navigate])

  const followUnfollowHandler = useCallback(async () => {
    if (isLoading || isLoggedInUserProfile) return

    try {
      setIsLoading(true)

      const res = await axios.post(
        `http://localhost:8000/api/v1/user/followorunfollow/${userProfile._id}`,
        {},
        { withCredentials: true },
      )

      if (res.data.success) {
        // Update the current user's following list
        const updatedUser = {
          ...user,
          following: isFollowing
            ? user.following.filter((id) => id !== userProfile._id)
            : [...user.following, userProfile._id],
        }
        dispatch(setAuthUser(updatedUser))

        // Update the userProfile's followers list
        const updatedUserProfile = {
          ...userProfile,
          followers: isFollowing
            ? userProfile.followers.filter((id) => id !== user.id)
            : [...userProfile.followers, user.id],
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
  }, [userProfile?._id, isFollowing, user, dispatch, isLoading, isLoggedInUserProfile, userProfile])

  const displayedPost = activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks

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
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{userProfile?.username}</h1>

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
                        <Button variant="outline" className="h-10 px-6 rounded-xl border-gray-300 bg-transparent">
                          View Archive
                        </Button>
                      </>
                    ) : (
                      <>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={followUnfollowHandler}
                            disabled={isLoading}
                            className={`h-10 px-6 rounded-xl font-medium transition-all ${
                              isFollowing
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
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Follow
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
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{userProfile?.posts?.length || 0}</p>
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

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="border-b border-gray-200">
              <div className="flex justify-center">
                {["posts", "saved"].map((tab) => (
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
        </div>
      </div>
    </motion.div>
  )
}

export default React.memo(Profile)