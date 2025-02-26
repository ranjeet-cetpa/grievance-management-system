import { AppDispatch } from '@/app/store';
import Loader from '@/components/ui/loader';
import { environment } from '@/config';
import { updateUser } from '@/features/user/userSlice';
import { getSessionItem, setSessionItem } from '@/lib/helperFunction';
import logger from '@/lib/logger';
import axiosInstance from '@/services/axiosInstance';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

const Login = () => {
  const isAuthenticated = getSessionItem('token');
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const authenticateUser = async () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      const name = urlParams.get('username');

      if (token && name && !isAuthenticated) {
        try {
          const response = await axiosInstance.post(`/Account/IsValidProgress?Token=${token}&EmpCode=${name}`);
          if (response.status === 200) {
            const authToken = response.data.data;
            const decodedUser = jwtDecode(authToken);
            dispatch(updateUser(decodedUser));
            setSessionItem('token', authToken);
            navigate('/dashboard');
          }
        } catch (error) {
          toast.error('Login failed');
          logger.error('Error during login:', error);
          window.location.href = environment.logoutUrl;
        }
      } else if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        toast.error('Invalid token or username');
        window.location.href = environment.logoutUrl;
      }
    };

    authenticateUser();
  }, [isAuthenticated, location, navigate, dispatch]);

  return (
    <div>
      <Loader />
    </div>
  );
};

export default Login;
