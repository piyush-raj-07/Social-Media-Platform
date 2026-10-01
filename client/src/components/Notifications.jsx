import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { API_URL } from "@/lib/config"
import { toast } from "sonner"
import { Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { setAuthUser } from "@/redux/authSlice"
import { setFollowRequests, setNotifications } from "@/redux/notificationSlice"
import useGetFollowRequests from "@/hooks/useGetFollowRequests"
import { timeAgo } from "@/lib/utils"

const Notifications = () => {
  useGetFollowRequests()
  const dispatch = useDispatch()
  const { user } = useSelector((store) => store.auth)
  const { followRequests, notifications } = useSelector((store) => store.notification)
  const [loadingId, setLoadingId] = useState(null)
  const [unreadIds, setUnreadIds] = useState([])

  // follow requests are already shown in their own section
  const activity = notifications.filter((n) => n.type !== "followRequest")

  // load notifications and mark them as read when page opens
  useEffect(() => {
    const openNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL}/notification/all`, { withCredentials: true })
        if (res.data.success) {
          const list = res.data.notifications

          // remember the new ones to highlight them
          setUnreadIds(list.filter((n) => !n.read).map((n) => n._id))

          // mark all as read -> badge goes away
          dispatch(setNotifications(list.map((n) => ({ ...n, read: true }))))
          await axios.post(`${API_URL}/notification/read`, {}, { withCredentials: true })
        }
      } catch (error) {
        console.log(error)
      }
    }
    openNotifications()
  }, [])

  // action is "accept" or "reject"
  const requestHandler = async (requesterId, action) => {
    try {
      setLoadingId(requesterId)
      const res = await axios.post(
        `${API_URL}/user/requests/${requesterId}/${action}`,
        {},
        { withCredentials: true },
      )

      if (res.data.success) {
        dispatch(setFollowRequests(followRequests.filter((req) => req._id !== requesterId)))
        // remove its notification too
        dispatch(setNotifications(notifications.filter((n) => !(n.type === "followRequest" && n.sender?._id === requesterId))))

        if (action === "accept") {
          dispatch(setAuthUser({ ...user, followers: [...user.followers, requesterId] }))
        }

        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Something went wrong")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Follow requests and activity</p>
        </div>

        <div className="p-4 space-y-6">
          {followRequests.length === 0 && activity.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <>
              {/* Follow requests */}
              {followRequests.length > 0 && (
                <div>
                  <h2 className="font-semibold text-gray-900 mb-2 px-3">Follow requests</h2>
                  {followRequests.map((req) => (
                    <div key={req._id} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-gray-50">
                      <Link to={`/profile/${req._id}`} className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-12 h-12 ring-2 ring-gray-100">
                          <AvatarImage src={req.profilePicture || "/placeholder.svg"} alt="profile" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                            {req.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-gray-700 truncate">
                          <span className="font-semibold text-gray-900">{req.username}</span> requested to follow you
                        </p>
                      </Link>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={loadingId === req._id}
                          onClick={() => requestHandler(req._id, "accept")}
                          className="h-8 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loadingId === req._id}
                          onClick={() => requestHandler(req._id, "reject")}
                          className="h-8 px-4 rounded-lg"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity (likes, comments, accepted requests) */}
              {activity.length > 0 && (
                <div>
                  <h2 className="font-semibold text-gray-900 mb-2 px-3">Activity</h2>
                  {activity.map((n) => {
                    const isNew = !n.read || unreadIds.includes(n._id)

                    return (
                      <div
                        key={n._id}
                        className={`flex items-center justify-between gap-3 p-3 rounded-xl ${isNew ? "bg-blue-50" : "hover:bg-gray-50"}`}
                      >
                        <Link to={`/profile/${n.sender?._id}`} className="flex items-center gap-3 min-w-0">
                          <Avatar className="w-12 h-12 ring-2 ring-gray-100">
                            <AvatarImage src={n.sender?.profilePicture || "/placeholder.svg"} alt="profile" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                              {n.sender?.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm text-gray-700 truncate">
                              <span className="font-semibold text-gray-900">{n.sender?.username}</span> {n.message}
                            </p>
                            <p className="text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
                          </div>
                        </Link>

                        {n.post?.image && (
                          <img src={n.post.image} alt="post" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications
