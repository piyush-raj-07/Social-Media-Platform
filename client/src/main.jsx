import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from './components/ui/sonner.jsx'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import axios from 'axios'
import { toast } from 'sonner'
import { setAuthUser } from './redux/authSlice.js'

let persistor = persistStore(store)

// server says "not logged in" (cookie expired / missing) -> logout in frontend too
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && store.getState().auth.user) {
      store.dispatch(setAuthUser(null)) // ProtectedRoutes then opens /login
      toast.error("Session expired, please login again")
    }
    return Promise.reject(error)
  }
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <Toaster />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)