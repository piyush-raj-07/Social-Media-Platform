import { useEffect } from 'react'
// import ChatPage from './components/ChatPage'
import EditProfile from './components/EditProfile'
import Home from './components/Home'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import Signup from './components/Signup'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
// import { io } from "socket.io-client";
// import { useDispatch, useSelector } from 'react-redux'
// import { setSocket } from './redux/socketSlice'
// import { setOnlineUsers } from './redux/chatSlice'
// import { setLikeNotification } from './redux/rtnSlice'
// import ProtectedRoutes from './components/ProtectedRoutes'


// Define the routing configuration
const browserRouter = createBrowserRouter([
  {
    path: "/",                   // main root route
    element: <MainLayout />,     // render MainLayout at "/"
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/profile/:id',
        element:  <Profile />
      },
      {
        path: '/account/edit',
        element: <EditProfile />
      },
    //   {
    //     path: '/chat',
    //     element: <ProtectedRoutes><ChatPage /></ProtectedRoutes>
    //   },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',             // accessible at "/signup"
    element: <Signup />          // renders Signup component
  },
]);

// Define the main App component
function App() {
  // const { user } = useSelector(store => store.auth);
  // const { socket } = useSelector(store => store.socketio);
  // const dispatch = useDispatch();

  // useEffect(() => {
  //   if (user) {
  //     const socketio = io('http://localhost:8000', {
  //       query: {
  //         userId: user?._id
  //       },
  //       transports: ['websocket']
  //     });
  //     dispatch(setSocket(socketio));

  //     // Listen for server events
  //     socketio.on('getOnlineUsers', (onlineUsers) => {
  //       dispatch(setOnlineUsers(onlineUsers));
  //     });

  //     socketio.on('notification', (notification) => {
  //       dispatch(setLikeNotification(notification));
  //     });

  //     return () => {
  //       socketio.close();
  //       dispatch(setSocket(null));
  //     }
  //   } else if (socket) {
  //     socket.close();
  //     dispatch(setSocket(null));
  //   }
  // }, [user, dispatch]);

  return (
    <>
      {/* Provide the router to your app */}
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;
