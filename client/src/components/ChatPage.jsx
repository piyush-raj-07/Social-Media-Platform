"use client"

import React, { useEffect, useState, useCallback, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { setSelectedUser } from "@/redux/authSlice"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Send, ArrowLeft, Search, MessageCircle } from "lucide-react"
import Messages from "./Messages"
import axios from "axios"
import { setMessages } from "@/redux/chatSlice"

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, suggestedUsers, selectedUser } = useSelector((store) => store.auth)
  const { onlineUsers, messages } = useSelector((store) => store.chat)
  const dispatch = useDispatch()

  // Unified view state for both mobile and desktop
  const [currentView, setCurrentView] = useState("userList") // "userList" or "chat"

  const sendMessageHandler = useCallback(
    async (receiverId) => {
      if (!textMessage.trim()) return

      try {
        setIsLoading(true)
        const res = await axios.post(
          `http://localhost:8000/api/v1/message/send/${receiverId}`,
          { textMessage },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          },
        )
        if (res.data.success) {
          dispatch(setMessages([...messages, res.data.newMessage]))
          setTextMessage("")
        }
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    },
    [textMessage, messages, dispatch],
  )

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        sendMessageHandler(selectedUser?._id)
      }
    },
    [sendMessageHandler, selectedUser],
  )

  const handleUserSelect = useCallback(
    (suggestedUser) => {
      dispatch(setSelectedUser(suggestedUser))
      setCurrentView("chat")
    },
    [dispatch],
  )

  const handleBackToUserList = useCallback(() => {
    setCurrentView("userList")
  }, [])

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return suggestedUsers
    return suggestedUsers.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [suggestedUsers, searchQuery])

  const memoizedSuggestedUsers = useMemo(
    () =>
      filteredUsers.map((suggestedUser, index) => {
        const isOnline = onlineUsers.includes(suggestedUser?._id)
        return (
          <motion.div
            key={suggestedUser._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleUserSelect(suggestedUser)}
            className="flex gap-4 items-center py-4 px-5 hover:bg-gray-50 cursor-pointer transition-colors duration-200 rounded-xl"
          >
            <div className="relative">
              <Avatar className="w-14 h-14 ring-2 ring-white shadow-sm">
                <AvatarImage src={suggestedUser?.profilePicture || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                  {suggestedUser?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800 truncate text-lg">{suggestedUser?.username}</h3>
                <span className="text-sm text-gray-500">2m</span>
              </div>
              <p className="text-gray-600 truncate">
                {isOnline ? "Online" : "Last seen recently"}
              </p>
            </div>
          </motion.div>
        )
      }),
    [filteredUsers, onlineUsers, handleUserSelect],
  )

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null))
    }
  }, [dispatch])

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto bg-white shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === "userList" ? (
            // User List View
            <motion.div
              key="userList"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-12 h-12 ring-2 ring-blue-100">
                    <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback className="bg-blue-500 text-white font-semibold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-bold text-2xl text-gray-800">{user?.username}</h1>
                    <p className="text-gray-600 mt-1">Messages</p>
                  </div>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 bg-gray-50 border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl h-12 text-base"
                  />
                </div>
              </div>
              
              {/* User List */}
              <div className="flex-1 overflow-y-auto">
                {memoizedSuggestedUsers.length > 0 ? (
                  <div className="p-4 space-y-2">
                    {memoizedSuggestedUsers}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <Search className="w-10 h-10" />
                    </div>
                    <h3 className="font-semibold text-xl mb-3">No conversations found</h3>
                    <p className="text-base text-center max-w-sm">
                      {searchQuery ? "Try searching for something else" : "Start a new conversation"}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            // Chat View
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              {/* Chat Header */}
              <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToUserList}
                    className="text-gray-600 hover:bg-gray-100 rounded-full w-12 h-12"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                  
                  <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
                    <AvatarImage src={selectedUser?.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                      {selectedUser?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-gray-800">{selectedUser?.username}</h3>
                    <p className="text-gray-600 mt-1">
                      {onlineUsers.includes(selectedUser?._id) ? (
                        <span className="text-green-600">Online</span>
                      ) : (
                        "Last seen recently"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-hidden">
                <Messages selectedUser={selectedUser} />
              </div>

              {/* Message Input */}
              <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200">
                <div className="flex items-center gap-4 max-w-4xl mx-auto">
                  <div className="flex-1">
                    <Input
                      value={textMessage}
                      onChange={(e) => setTextMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      type="text"
                      className="w-full border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-6 py-4 bg-gray-50 text-base placeholder-gray-500"
                      placeholder="Type a message..."
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    onClick={() => sendMessageHandler(selectedUser?._id)}
                    disabled={!textMessage.trim() || isLoading}
                    className="rounded-xl w-12 h-12 p-0 bg-blue-500 hover:bg-blue-600 shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default React.memo(ChatPage)