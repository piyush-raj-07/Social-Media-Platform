import React from 'react'
import Post from './Post'
// import { useSelector } from 'react-redux'

const Posts = () => {
//   const {posts} = useSelector(store=>store.post);
  return (
    <div>
        {
            [1,3,2,4].map((post,index) => <Post key={index} post={post}/>)
        }
    </div>
  )
}

export default Posts