import React, { useEffect, useState } from "react"
import axios from "axios"
import { API_URL } from "@/lib/config"
import { toast } from "sonner"
import { Check, Loader2, Search, X } from "lucide-react"
import { Dialog, DialogContent } from "./ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"

const ShareDialog = ({ open, setOpen, post }) => {
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  // load people (following + followers) when dialog opens
  useEffect(() => {
    if (!open) return

    const fetchUsers = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${API_URL}/user/share-list`, { withCredentials: true })
        if (res.data.success) {
          setUsers(res.data.users)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [open])

  const toggleUser = (userId) => {
    setSelected((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const closeHandler = () => {
    setOpen(false)
    setSelected([])
    setSearch("")
    setText("")
  }

  const shareHandler = async () => {
    if (selected.length === 0 || sending) return

    try {
      setSending(true)
      // one message for each selected user
      await Promise.all(
        selected.map((userId) =>
          axios.post(
            `${API_URL}/message/send/${userId}`,
            { textMessage: text, postId: post._id },
            { withCredentials: true },
          ),
        ),
      )
      toast.success(selected.length > 1 ? `Sent to ${selected.length} people` : "Sent")
      closeHandler()
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to share post")
    } finally {
      setSending(false)
    }
  }

  const filteredUsers = users.filter((u) => u.username?.toLowerCase().includes(search.toLowerCase().trim()))

  return (
    <Dialog open={open} onOpenChange={(value) => !value && closeHandler()}>
      <DialogContent className="max-w-md w-[95vw] p-0 gap-0 overflow-hidden rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="w-9" />
          <h2 className="font-semibold text-gray-900">Share</h2>
          <button onClick={closeHandler} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-full bg-gray-100 outline-none border border-transparent focus:bg-white focus:border-gray-300 transition-all"
            />
          </div>
        </div>

        {/* People list */}
        <div className="h-72 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-10">
              {users.length === 0 ? "Follow people to share posts with them" : "No user found"}
            </p>
          ) : (
            filteredUsers.map((u) => {
              const isSelected = selected.includes(u._id)

              return (
                <div
                  key={u._id}
                  onClick={() => toggleUser(u._id)}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-11 h-11 ring-2 ring-gray-100">
                      <AvatarImage src={u.profilePicture || "/placeholder.svg"} alt="profile" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                        {u.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm text-gray-900 truncate">{u.username}</span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Message + send */}
        <div className="px-4 py-3 border-t border-gray-100 space-y-3">
          {selected.length > 0 && (
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a message..."
              className="w-full text-sm px-4 py-2 rounded-full bg-gray-100 outline-none border border-transparent focus:bg-white focus:border-gray-300 transition-all"
            />
          )}
          <Button
            onClick={shareHandler}
            disabled={selected.length === 0 || sending}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShareDialog
