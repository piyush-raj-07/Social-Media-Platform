"use client"

import React, { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import axios from "axios"
import { toast } from "sonner"
import { Link, useNavigate } from "react-router-dom"
import { Loader2, Eye, EyeOff, User, Mail, Lock } from "lucide-react"
import { useSelector } from "react-redux"

const Signup = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { user } = useSelector((store) => store.auth)
  const navigate = useNavigate()

  const changeEventHandler = useCallback((e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }, [])

  const signupHandler = useCallback(
    async (e) => {
      e.preventDefault()

      if (!input.username || !input.email || !input.password) {
        toast.error("Please fill in all fields")
        return
      }

      // if (input.password.length < 6) {
      //   toast.error("Password must be at least 6 characters")
      //   return
      // }

      try {
        setLoading(true)
        const res = await axios.post("http://localhost:8000/api/v1/user/register", input, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        })

        if (res.data.success) {
          navigate("/login")
          toast.success(res.data.message)
          setInput({ username: "", email: "", password: "" })
        }
      } catch (error) {
        console.log(error)
        toast.error(error.response?.data?.message || "Signup failed")
      } finally {
        setLoading(false)
      }
    },
    [input, navigate],
  )

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <form onSubmit={signupHandler} className="bg-white shadow-xl rounded-2xl p-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Gupshup
            </h1>
            <p className="text-gray-600">Sign up to see photos from your friends</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Username
            </label>
            <Input
              type="text"
              name="username"
              value={input.username}
              onChange={changeEventHandler}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter your username"
              required
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter your email"
              required
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={input.password}
                onChange={changeEventHandler}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
           
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            {loading ? (
              <Button disabled className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </Button>
            ) : (
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Sign Up
                </Button>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <span className="text-gray-600">
              Already have an account?
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                Login
              </Link>
            </span>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}

export default React.memo(Signup)
