import React from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { timeAgo } from '@/lib/utils'

// onUserClick -> closes the comment dialog when opening a profile
const Comment = ({ comment, onUserClick }) => {
    const profileLink = `/profile/${comment?.author?._id}`

    return (
        <div className='flex gap-3 items-start'>
            <Link to={profileLink} onClick={onUserClick} className='shrink-0'>
                <Avatar className="w-8 h-8 ring-2 ring-gray-100">
                    <AvatarImage src={comment?.author?.profilePicture} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-xs">
                        {comment?.author?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </Link>
            <div className='flex-1 min-w-0'>
                <p className='text-sm text-gray-700 leading-relaxed break-words'>
                    <Link to={profileLink} onClick={onUserClick} className='font-semibold text-gray-900 mr-2 hover:text-gray-600'>
                        {comment?.author?.username}
                    </Link>
                    {comment?.text}
                </p>
                <span className='text-xs text-gray-400'>{timeAgo(comment?.createdAt)}</span>
            </div>
        </div>
    )
}

export default Comment
