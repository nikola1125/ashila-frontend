import React, { useContext } from 'react';
import { AuthContext } from '../../Context/Auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import userLogo from '../../assets/userLogo.png';
import { User, Mail, Package, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOutUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-white py-10">
      <Helmet key={location.pathname}>
        <title>Your Profile</title>
      </Helmet>
      <div className="bg-white rounded-sm shadow-sm p-8 max-w-md w-full flex flex-col items-center border border-gray-200">
        <div className="relative mb-6">
          <img
            src={user?.photoURL || userLogo}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 shadow-sm"
          />
          <span className="absolute bottom-2 right-2 bg-[#946259] p-1.5 shadow-md border-2 border-[#946259]">
            <User className="text-white w-5 h-5" />
          </span>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
            {user?.displayName || 'No Name'}
          </h2>
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
            <Mail className="w-5 h-5" />
            <span className="text-base font-medium">
              {user?.email || 'No Email'}
            </span>
          </div>
        </div>
        
        {/* Dashboard Button */}
        <button
          onClick={() => navigate('/dashboard/user-dashboard')}
          className="w-full bg-[#946259] hover:bg-[#7a4f47] text-white px-6 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2 mb-3 border-2 border-[#946259] uppercase tracking-wide"
        >
          <Package className="w-5 h-5" />
          View My Orders
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white border-2 border-[#8B4513] hover:bg-[#faf9f6] text-[#8B4513] hover:text-[#6B4423] px-6 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wide"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
