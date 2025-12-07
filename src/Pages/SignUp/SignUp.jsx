import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Context/Auth/AuthContext';
import { toast } from 'react-toastify';

import useAxiosSecure from '../../hooks/useAxiosSecure';
import { getAdditionalUserInfo } from 'firebase/auth';
import Loading from '../../Components/Common/Loaders/Loading';
import { Helmet } from 'react-helmet-async';

const SignUp = () => {
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { publicApi } = useAxiosSecure();

  const { createUser, updateUser, signInWithGoogle, setUser } =
    useContext(AuthContext);

  // email password sign up
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMessage('');

    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      // create user in firebase
      const userCredential = await createUser(email, password);

      // update user profile with name only (no photo)
      await updateUser(name, null);

      // set user in context for real time update in ui
      setUser({
        ...userCredential.user,
        displayName: name,
        photoURL: null,
      });

      // upload user to mongodb - everyone registers as 'user' role
      const userInfo = {
        name,
        email,
        role: 'user',
        photoURL: null,
        created_at: new Date().toISOString(),
      };

      await publicApi.post('/users', userInfo);

      // success actions
      navigate('/');
      toast.success('Registration successful');
    } catch (error) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered. Please login instead.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password should be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email address. Please check your email.');
      } else if (error.code === 'auth/configuration-not-found') {
        setErrorMessage('Firebase configuration error. Please contact support.');
      } else {
        setErrorMessage(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // social signup
  const handleSignInWithGoogle = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      // sign in with google
      const userCredential = await signInWithGoogle();
      const additionalInfo = getAdditionalUserInfo(userCredential);
      
      if (additionalInfo?.isNewUser) {
        // get user info for new users
        const userInfo = {
          name: additionalInfo.profile.name || userCredential.user.displayName || 'User',
          email: additionalInfo.profile.email || userCredential.user.email,
          role: 'user',
          photoURL: additionalInfo.profile.picture || userCredential.user.photoURL || null,
          created_at: new Date().toISOString(),
        };

        // upload to mongodb
        await publicApi.post('/users', userInfo);
        toast.success('Registration successful');
      } else {
        toast.success('Login successful');
      }
      
      // success actions
      navigate(location.state?.from || '/');
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in popup was closed. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setErrorMessage('Popup was blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/configuration-not-found') {
        setErrorMessage('Firebase configuration error. Please contact support.');
      } else {
        setErrorMessage(error.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex justify-center'>
      <Helmet key={location.pathname}>
        <title>Sign Up</title>
      </Helmet>
      <div className="w-full max-w-md p-8 space-y-3 rounded-sm bg-white text-gray-800 border border-gray-300 my-6 shadow-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User name */}
          <div className="space-y-1 text-sm">
            <label htmlFor="name" className="block text-gray-700 font-medium">
              User Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Enter Your Name"
              className="w-full px-4 py-3 border-2 border-[#d4d4c4] bg-white text-[#2c2c2c] focus:border-[#946259] focus:ring-2 focus:ring-[#946259] outline-none"
            />
          </div>

          {/* Email */}
          <div className="space-y-1 text-sm">
            <label htmlFor="email" className="block text-gray-700 font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="Enter Your Email"
              className="w-full px-4 py-3 border-2 border-[#d4d4c4] bg-white text-[#2c2c2c] focus:border-[#946259] focus:ring-2 focus:ring-[#946259] outline-none"
            />
          </div>
          
          {/* Password */}
          <div className="space-y-1 text-sm">
            <label htmlFor="password" className="block text-gray-700 font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="Enter A Password"
              className="w-full px-4 py-3 border-2 border-[#d4d4c4] bg-white text-[#2c2c2c] focus:border-[#946259] focus:ring-2 focus:ring-[#946259] outline-none"
            />
          </div>
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          <button className="block w-full p-3 text-center text-white bg-[#946259] hover:bg-[#7a4f47] transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#946259] uppercase tracking-wide">
            {isLoading ? <Loading /> : 'Sign Up'}
          </button>
        </form>
        <div className="flex items-center pt-4 space-x-1">
          <div className="flex-1 h-px sm:w-16 bg-gray-300"></div>
          <p className="px-3 text-sm text-gray-600">
            Login with social accounts
          </p>
          <div className="flex-1 h-px sm:w-16 bg-gray-300"></div>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleSignInWithGoogle}
            disabled={isLoading}
            aria-label="Sign up with Google"
            className="p-3 rounded-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sign up with Google"
          >
            {isLoading ? (
              <Loading />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                className="w-5 h-5 fill-current"
              >
                <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z"></path>
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-center sm:px-6 text-gray-600">
          Already have an account?
          <Link to="/login" className="underline text-gray-800 hover:text-gray-900 ml-1">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
