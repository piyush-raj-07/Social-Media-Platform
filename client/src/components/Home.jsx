"use client"

import React from "react"
import { motion } from "framer-motion"
import Feed from "./Feed"
import { Outlet } from "react-router-dom"
import RightSidebar from "./RightSidebar"
import useGetAllPost from "@/hooks/useGetAllPosts"
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers"

const Home = () => {
  useGetAllPost()
  useGetSuggestedUsers()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen bg-gray-50">
      <div className="flex-grow">
        <Feed />
        <Outlet />
      </div>
      <RightSidebar />
    </motion.div>
  )
}

export default React.memo(Home)
