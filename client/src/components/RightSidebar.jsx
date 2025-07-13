"use client"

import React from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import SuggestedUsers from "./SuggestedUsers"

const RightSidebar = () => {
  const { user } = useSelector((store) => store.auth)

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 my-10 pr-8 hidden lg:block"
    >
      {/* User Profile Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6"
      >
        <div className="flex items-center gap-4">
          <Link to={`/profile/${user?.id}`}>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Avatar className="w-16 h-16 ring-2 ring-gray-100 shadow-sm">
                <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt="profile" />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xl">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </Link>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 truncate">
              <Link to={`/profile/${user?.id}`} className="hover:text-gray-700 transition-colors">
                {user?.username}
              </Link>
            </h2>
            <p className="text-gray-500 text-sm truncate">{user?.bio || "Welcome to our platform!"}</p>
          </div>
        </div>
      </motion.div>

      {/* Suggested Users */}
      <SuggestedUsers />

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-gray-400">© 2024 Social App. All rights reserved.</p>
      </motion.div>
    </motion.div>
  )
}

export default React.memo(RightSidebar)
