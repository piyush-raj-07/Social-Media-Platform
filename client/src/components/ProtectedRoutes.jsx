import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';

const ProtectedRoutes = ({children}) => {
    const {user} = useSelector(store=>store.auth);
    const navigate = useNavigate();
    
    useEffect(()=>{
        if(!user){
            navigate("/login");
        }
    },[user, navigate]); // Added user and navigate to dependency array
    
    // Don't render children if user is not authenticated
    if(!user){
        return null; // or return a loading spinner
    }
    
    return <>{children}</>
}

export default ProtectedRoutes;