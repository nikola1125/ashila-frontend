import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../../Context/Auth/AuthContext';
import { toast } from 'react-toastify';

const ProfileLinks = () => {
  const {signOutUser} = useContext(AuthContext)


  const handleSignOut = () => {
    signOutUser()
      .then(() => toast.success('LogOut successful'))
      .catch((err) => console.log(err.message));
  };
  return (
    <>
      <li>
        <Link to='/profile'>Profile</Link>
      </li>
      <li>
        <Link to='/dashboard'>Dashboard</Link>
      </li>
      <li>
        <button onClick={handleSignOut}>Logout</button>
      </li>
    </>
  );
};

export default ProfileLinks;
