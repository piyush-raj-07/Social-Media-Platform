import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import Comment from './Comment'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts } from '@/redux/postSlice'

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector(store => store.post);
  const [comment, setComment] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
    }
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  }

  const sendMessageHandler = async () => {
    try {
      const res = await axios.post(`http://localhost:8000/api/v1/post/${selectedPost?._id}/comment`, { text }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map(p =>
          p._id === selectedPost._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="max-w-5xl p-0 flex flex-col bg-white rounded-xl shadow-2xl">
        <div className='flex flex-1'>
          <div className='w-1/2'>
            <img
              src={selectedPost?.image}
              alt="post_img"
              className='w-full h-full object-cover rounded-l-xl'
            />
          </div>
          <div className='w-1/2 flex flex-col justify-between bg-white rounded-r-xl'>
            <div className='flex items-center justify-between p-6 border-b border-gray-100'>
              <div className='flex gap-3 items-center'>
                <Link>
                  <Avatar className="w-10 h-10 ring-2 ring-gray-100">
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link className='font-semibold text-sm text-gray-800 hover:text-blue-600 transition-colors'>
                    {selectedPost?.author?.username}
                  </Link>
                </div>
              </div>

              {/* <Dialog>
                <DialogTrigger asChild>
                  <button className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
                    <MoreHorizontal className='cursor-pointer w-5 h-5 text-gray-600' />
                  </button>
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center text-sm text-center bg-white rounded-xl shadow-lg">
                  <div className='cursor-pointer w-full text-red-500 font-semibold py-3 hover:bg-red-50 rounded-lg transition-colors'>
                    Unfollow
                  </div>
                  <div className='cursor-pointer w-full text-gray-700 py-3 hover:bg-gray-50 rounded-lg transition-colors'>
                    Add to favorites
                  </div>
                </DialogContent>
              </Dialog> */}
            </div>
            
            <div className='flex-1 overflow-y-auto max-h-96 p-6 bg-gray-50/30'>
              <div className="space-y-4">
                {comment.map((comment) => (
                  <Comment key={comment._id} comment={comment} />
                ))}
              </div>
              {comment.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
            
            <div className='p-6 bg-white border-t border-gray-100'>
              <div className='flex items-center gap-3'>
                <input 
                  type="text" 
                  value={text} 
                  onChange={changeEventHandler} 
                  placeholder='Add a comment...' 
                  className='flex-1 outline-none border border-gray-200 text-sm px-4 py-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white' 
                />
                <Button 
                  disabled={!text.trim()} 
                  onClick={sendMessageHandler} 
                  className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                    text.trim() 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CommentDialog