"use client"

import React, { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Navigate, Outlet } from "react-router-dom"
import LeftSidebar from "./LeftSidebar"
import { Menu } from "lucide-react"
import { Button } from "./ui/button"

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])
  

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">
      {/* Mobile Header for Sidebar Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm p-4 z-20 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="w-6 h-6 text-gray-700" />
        </Button>
        <h1 
        
        className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
           Gupshup
        </h1>
        {/* Placeholder for right side if needed */}
        <div className="w-10"></div>
      </div>

      <LeftSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content area */}
      <div
        className={`min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? "ml-0" : "md:ml-[16%] ml-0"}`}
      >
        <div className="md:pt-0 pt-16">
          {/* Add padding for mobile header */}
          <Outlet />
        </div>
      </div>
    </motion.div>
  )
}

export default React.memo(MainLayout)
