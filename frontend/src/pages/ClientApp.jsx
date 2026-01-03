import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../store/authSlice';
import { onSubmitAxios } from '../utils/axios';

const ClientApp = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isFetched, setIsFetched] = useState(false)
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const location = useLocation();
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await onSubmitAxios("post", "users/login-via-access-token");
                 dispatch(
                        login({
                          username: response?.data.data.user.username,
                          fullName: response?.data.data.user.fullName,
                          id: response?.data.data.user._id,
                          avatar: response?.data.data.user.avatar,
                          isAuthenticated: true,
                        })
                      );
            } catch (error) {
                //pass
            }
            setIsFetched(true)
           
        }
        fetchUser()
    }, [])
    useEffect(() => {
        if(!isFetched) return
        const authPages = ["/login", "/register"];
        if (isAuthenticated && authPages.includes(location.pathname)) {
          navigate("/home", { replace: true });
        }
    
        if (!isAuthenticated && !authPages.includes(location.pathname)) {
          navigate("/login", { replace: true });
        }
      }, [isAuthenticated, location.pathname, navigate, isFetched]);
    
      return null;
    };
    
    export default ClientApp;