import axios from 'axios';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from '../Context/Auth/AuthContext';

const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { user, signOutUser } = useContext(AuthContext);
  // public api
  const publicApi = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_API}`,
  });

  publicApi.interceptors.response.use(
    (res) => {
      // console.log('axios res :', res.data);
      return res.data;
    },
    (err) => {
      console.error('Public API error', err?.response || err);
      return Promise.reject(err);
    }
  );

  // private api
  const privateApi = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_API}`,
  });

  privateApi.interceptors.request.use(
    async (config) => {
      if (user) {
        try {
          // Get the current ID token, which will refresh if needed
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
          console.error('Error getting ID token:', error);
          // If we can't get the token, sign out the user
          await signOutUser();
          navigate('/login');
          return Promise.reject(error);
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  privateApi.interceptors.response.use(
    (res) => {
      // console.log('axios res :', res.data);
      return res.data;
    },
    (error) => {
      const status = error.response?.status;
      // Only redirect on 403 if it's not during the initial loading state
      if (status === 403 && user) {
        navigate('/forbidden');
      } else if (status === 401) {
        signOutUser()
          .then(() => {
            navigate('/login');
          })
          .catch((error) => {
            console.log(error);
          });
      }
      return Promise.reject(error);
    }
  );

  return { publicApi, privateApi };
};

export default useAxiosSecure;
