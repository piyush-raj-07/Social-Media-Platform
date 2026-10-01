"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import useGetAllMessage from "@/hooks/useGetAllMessage"
import useGetRTM from "@/hooks/useGetRTM"
import CommentDialog from "./CommentDialog"
import { setSelectedPost } from "@/redux/postSlice"

const Messages = ({ selectedUser }) => {
  useGetRTM()
  useGetAllMessage()

  const { messages } = useSelector((store) => store.chat)
  const { user } = useSelector((store) => store.auth)
  const messagesEndRef = useRef(null)
  const [postOpen, setPostOpen] = useState(false)
  const dispatch = useDispatch()

  // open shared post with its comments
  const openPostHandler = (post) => {
    dispatch(setSelectedPost(post))
    setPostOpen(true)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Format time helper
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30">
        {messages && messages.length > 0 ? (
          <div className="px-6 py-8 space-y-6 max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.map((msg, index) => {
                const isOwnMessage = msg.senderId === user?.id
                const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId
                const showTime = index === messages.length - 1 || 
                  messages[index + 1]?.senderId !== msg.senderId ||
                  (new Date(messages[index + 1]?.createdAt) - new Date(msg.createdAt)) > 300000

                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.2, 
                      delay: index * 0.02,
                      ease: "easeOut"
                    }}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} items-end gap-4`}
                  >
                    {/* Avatar for received messages */}
                    {!isOwnMessage && showAvatar && (
                      <Link to={`/profile/${selectedUser?._id}`}>
                        <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-white shadow-sm hover:ring-blue-200 transition-all duration-200">
                          <AvatarImage src={selectedUser?.profilePicture || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-semibold">
                            {selectedUser?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    )}
                    {!isOwnMessage && !showAvatar && <div className="w-10 flex-shrink-0" />}

                    {/* Message Content */}
                    <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} max-w-[65%] sm:max-w-[55%]`}>
                      {/* Shared post */}
                      {msg.type === "post" && (
                        msg.sharedPost ? (
                          <div
                            onClick={() => openPostHandler(msg.sharedPost)}
                            className="w-56 sm:w-64 mb-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-2 px-3 py-2">
                              <Avatar className="w-7 h-7">
                                <AvatarImage src={msg.sharedPost.author?.profilePicture || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-semibold">
                                  {msg.sharedPost.author?.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-sm text-gray-900 truncate">{msg.sharedPost.author?.username}</span>
                            </div>
                            <img src={msg.sharedPost.image} alt="shared_post" className="w-full aspect-square object-cover" />
                            {msg.sharedPost.caption && (
                              <p className="px-3 py-2 text-sm text-gray-700 truncate">
                                <span className="font-semibold text-gray-900 mr-1">{msg.sharedPost.author?.username}</span>
                                {msg.sharedPost.caption}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="w-56 sm:w-64 mb-1 px-4 py-6 bg-gray-100 border border-gray-200 rounded-2xl text-center">
                            <p className="font-semibold text-sm text-gray-700">Post unavailable</p>
                            <p className="text-xs text-gray-500 mt-1">This post was deleted or is from a private account</p>
                          </div>
                        )
                      )}

                      {/* Text message */}
                      {msg.message && (
                        <div
                          className={`px-5 py-3.5 rounded-2xl text-base shadow-sm ${
                            isOwnMessage
                              ? "bg-blue-500 text-white rounded-br-md"
                              : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                          }`}
                        >
                          <p className="leading-6 break-words">{msg.message}</p>
                        </div>
                      )}
                      
                      {/* Timestamp */}
                      {showTime && (
                        <span className="text-xs text-gray-500 mt-2 px-3">
                          {formatTime(msg.createdAt)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        ) : (
          // Empty state for no messages
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Start a conversation</h3>
            <p className="text-base text-center max-w-sm leading-relaxed">
              Send a message to {selectedUser?.username} to get started
            </p>
          </div>
        )}
      </div>

      <CommentDialog open={postOpen} setOpen={setPostOpen} />
    </div>
  )
}

export default React.memo(Messages)