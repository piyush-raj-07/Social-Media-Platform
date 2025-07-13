import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const Comment = ({ comment }) => {
    return (
        <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
            <div className='flex gap-3 items-start'>
                <Avatar className="w-8 h-8 ring-2 ring-gray-100">
                    <AvatarImage src={comment?.author?.profilePicture} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-xs">CN</AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                        <h3 className='font-semibold text-sm text-gray-800'>{comment?.author.username}</h3>
                        <span className='text-xs text-gray-500'>·</span>
                        <span className='text-xs text-gray-500'>now</span>
                    </div>
                    <p className='text-sm text-gray-700 leading-relaxed'>{comment?.text}</p>
                </div>
            </div>
        </div>
    )
}

export default Comment