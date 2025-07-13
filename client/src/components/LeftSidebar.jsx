"use client"

import React, { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { toast } from "sonner"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { setAuthUser } from "@/redux/authSlice"
import CreatePost from "./CreatePost"
import { setPosts, setSelectedPost } from "@/redux/postSlice"
import { Button } from "./ui/button"

const LeftSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate()
  const { user } = useSelector((store) => store.auth)
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [activeItem, setActiveItem] = useState("Home")

  const logoutHandler = useCallback(async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/v1/user/logout", { withCredentials: true })
      if (res.data.success) {
        dispatch(setAuthUser(null))
        dispatch(setSelectedPost(null))
        dispatch(setPosts([]))
        navigate("/login")
        toast.success(res.data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed")
    }
  }, [dispatch, navigate])

  const sidebarHandler = useCallback(
  (textType) => {
    setActiveItem(textType)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }

    switch (textType) {
      case "Logout":
        logoutHandler()
        break
      case "Create":
        setOpen(true)
        break
      case "Profile":
        navigate(`/profile/${user?.id}`)
        break
      case "Home":
        navigate("/")
        break
      case "Search":  // Add this case
        navigate("/search")
        break
      case "Messages":
        navigate("/chat")
        break
      default:
        break
    }
  },
  [logoutHandler, navigate, user?.id, setSidebarOpen]
)

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt="profile" />
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
            {user?.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ]

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`fixed top-0 z-50 left-0 px-6 border-r border-gray-200 h-screen bg-white shadow-lg md:shadow-sm transition-all duration-300 ease-in-out ${
        sidebarOpen ? "w-full sm:w-64" : "w-0 md:w-[16%] hidden md:block"
      }`}
    >
      <div className="flex flex-col h-full">
        {sidebarOpen && (
          <div className="md:hidden flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-700" />
            </Button>
          </div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/')}
          className="my-8 pl-3 font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer mb-6"
        >
          Gupshup
        </motion.h1>

        <nav className="flex-1">
          <AnimatePresence>
            {sidebarItems.map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5, backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sidebarHandler(item.text)}
                className={`flex items-center gap-4 relative cursor-pointer rounded-xl py-4 px-4 my-3 transition-all duration-200 ${
                  activeItem === item.text ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-gray-100"
                }`}
              >
                <motion.div
                  animate={{
                    scale: activeItem === item.text ? 1.1 : 1,
                    color: activeItem === item.text ? "#2563eb" : "#374151",
                  }}
                >
                  {item.icon}
                </motion.div>
                <span className={activeItem === item.text ? "text-blue-600" : "text-gray-700"}>{item.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </nav>
      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </motion.div>
  )
}

export default React.memo(LeftSidebar)
