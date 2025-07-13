"use client"

import React, { useRef, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import axios from "axios"
import { Loader2, Camera, User, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { setAuthUser } from "@/redux/authSlice"

const EditProfile = () => {
  const imageRef = useRef()
  const { user } = useSelector((store) => store.auth)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState({
    profilePhoto: user?.profilePicture,
    bio: user?.bio || "",
    gender: user?.gender || "",
  })
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const fileChangeHandler = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB")
        return
      }
      setInput((prev) => ({ ...prev, profilePhoto: file }))
    }
  }, [])

  const selectChangeHandler = useCallback((value) => {
    setInput((prev) => ({ ...prev, gender: value }))
  }, [])

  const editProfileHandler = useCallback(async () => {
    const formData = new FormData()
    formData.append("bio", input.bio)
    formData.append("gender", input.gender)
    if (input.profilePhoto && typeof input.profilePhoto !== "string") {
      formData.append("profilePhoto", input.profilePhoto)
    }

    try {
      setLoading(true)
      const res = await axios.post("http://localhost:8000/api/v1/user/profile/edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      })

      if (res.data.success) {
        const updatedUserData = {
          ...user,
          bio: res.data.user?.bio,
          profilePicture: res.data.user?.profilePicture,
          gender: res.data.user.gender,
        }
        dispatch(setAuthUser(updatedUserData))
        navigate(`/profile/${user?.id}`)
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }, [input, user, dispatch, navigate])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 w-full" // Removed min-h-screen and pl-[16%]
    >
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-1">Update your profile information</p>
          </div>

          <div className="p-6 space-y-8">
            {/* Profile Photo Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 rounded-xl"
            >
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-white shadow-lg">
                  <AvatarImage
                    src={
                      typeof input.profilePhoto === "string"
                        ? input.profilePhoto || "/placeholder.svg"
                        : URL.createObjectURL(input.profilePhoto)
                    }
                    alt="profile"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-2xl">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2 shadow-lg cursor-pointer"
                  onClick={() => imageRef?.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                </motion.div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-lg text-gray-900">{user?.username}</h3>
                <p className="text-gray-600 mb-4">{user?.bio || "Add a bio to tell people about yourself"}</p>
                <input ref={imageRef} onChange={fileChangeHandler} type="file" className="hidden" accept="image/*" />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => imageRef?.current?.click()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                  >
                    Change Photo
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Bio Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="w-5 h-5" />
                Bio
              </label>
              <Textarea
                value={input.bio}
                onChange={(e) => setInput((prev) => ({ ...prev, bio: e.target.value }))}
                name="bio"
                className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                placeholder="Tell people about yourself..."
              />
              <p className="text-sm text-gray-500">{input.bio.length}/150 characters</p>
            </motion.div>

            {/* Gender Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <User className="w-5 h-5" />
                Gender
              </label>
              <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
                <SelectTrigger className="w-full h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end pt-6 border-t border-gray-200"
            >
              {loading ? (
                <Button disabled className="px-8 py-3 bg-blue-600 text-white rounded-xl">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </Button>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={editProfileHandler}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium"
                  >
                    Save Changes
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default React.memo(EditProfile)
