"use client"
import { motion } from "framer-motion"
import Posts from "./Posts"

const Feed = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 my-8 flex flex-col items-center md:pl-0 bg-gray-50 min-h-screen"
    >
      <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-8">
        {" "}
        {/* Added horizontal padding */}
        <Posts />
      </div>
    </motion.div>
  )
}

export default Feed
