"use client"

import React, { useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { readFileAsDataURL } from "@/lib/utils"
import { Loader2, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import { useDispatch, useSelector } from "react-redux"
import { setPosts } from "@/redux/postSlice"

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef()
  const [file, setFile] = useState("")
  const [caption, setCaption] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useSelector((store) => store.auth)
  const { posts } = useSelector((store) => store.post)
  const dispatch = useDispatch()

  const fileChangeHandler = useCallback(async (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB")
        return
      }
      setFile(selectedFile)
      const dataUrl = await readFileAsDataURL(selectedFile)
      setImagePreview(dataUrl)
    }
  }, [])

  const removeImage = useCallback(() => {
    setFile("")
    setImagePreview("")
    if (imageRef.current) {
      imageRef.current.value = ""
    }
  }, [])

  const createPostHandler = useCallback(
    async (e) => {
      e.preventDefault()

      if (!caption.trim() && !imagePreview) {
        toast.error("Please add a caption or image")
        return
      }

      const formData = new FormData()
      formData.append("caption", caption)
      if (imagePreview) formData.append("image", file)

      try {
        setLoading(true)
        const res = await axios.post("http://localhost:8000/api/v1/post/addpost", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        })

        if (res.data.success) {
          dispatch(setPosts([res.data.post, ...posts]))
          toast.success(res.data.message)
          handleClose()
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to create post")
      } finally {
        setLoading(false)
      }
    },
    [caption, imagePreview, file, posts, dispatch],
  )

  const handleClose = useCallback(() => {
    setOpen(false)
    setCaption("")
    setImagePreview("")
    setFile("")
  }, [setOpen])

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent onInteractOutside={handleClose} className="max-w-2xl p-0 overflow-hidden bg-white rounded-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-center font-bold text-xl text-gray-900">Create New Post</h2>
              </DialogHeader>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* User Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 items-center p-4 bg-gray-50 rounded-xl"
                >
                  <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
                    <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt="profile" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user?.username}</h3>
                    <span className="text-gray-500 text-sm">{user?.bio || "Share your moment..."}</span>
                  </div>
                </motion.div>

                {/* Caption Input */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    placeholder="What's on your mind?"
                  />
                </motion.div>

                {/* Image Preview */}
                <AnimatePresence>
                  {imagePreview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative rounded-xl overflow-hidden bg-gray-100 shadow-sm"
                    >
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="preview"
                        className="w-full h-64 sm:h-80 object-cover"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={removeImage}
                        className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* File Input */}
                <input ref={imageRef} type="file" className="hidden" onChange={fileChangeHandler} accept="image/*" />

                {/* Upload Button */}
                {!imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      onClick={() => imageRef.current?.click()}
                      variant="outline"
                      className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all rounded-xl"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <motion.div whileHover={{ scale: 1.1 }} className="p-3 bg-blue-100 rounded-full">
                          <ImageIcon className="w-8 h-8 text-blue-600" />
                        </motion.div>
                        <div className="text-center">
                          <p className="font-medium text-gray-700">Click to upload an image</p>
                          <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3 pt-4"
                >
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-gray-300 bg-transparent"
                    disabled={loading}
                  >
                    Cancel
                  </Button>

                  <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      onClick={createPostHandler}
                      disabled={loading || (!caption.trim() && !imagePreview)}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Share Post"
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default React.memo(CreatePost)
