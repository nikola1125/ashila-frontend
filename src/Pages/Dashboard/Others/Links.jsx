import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import useUserRole from '../../../hooks/useUserRole';
import {
  LayoutDashboard,
  Stethoscope,
  History,
  BadgeDollarSign,
  LogOut,
  Home,
} from 'lucide-react';
import { AuthContext } from '../../../Context/Auth/AuthContext';
import { toast } from 'react-toastify';

const linkClass =
  'flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-200 hover:bg-blue-100/80 hover:text-blue-900 font-medium text-blue-800/90 text-base shadow-sm';
const activeClass = 'bg-blue-200/80 text-blue-900 shadow-inner font-semibold';
const sectionHeader =
  'uppercase text-xs tracking-widest text-blue-400 font-bold px-5 pt-6 pb-2';
const divider = 'my-2 border-t border-blue-100';

const Links = () => {
  const { signOutUser } = useContext(AuthContext);
  const { role } = useUserRole();
  const handleSignOut = () => {
    signOutUser()
      .then(() => {
        toast.success('LogOut successful')
      })
      .catch((err) => console.log(err.message));
  };
  return (
    <ul className="flex flex-col gap-1 h-full">
      <li className={sectionHeader}>Main</li>
      <li>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <Home size={22} className="text-blue-500" />
          Home
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          <LayoutDashboard size={22} className="text-blue-500" />
          Dashboard
        </NavLink>
      </li>
      <div className={divider}></div>
      {role === 'seller' && (
        <>
          <li className={sectionHeader}>Seller Panel</li>
          <li>
            <NavLink
              to="/dashboard/manage-medicine"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ''}`
              }
            >
              <Stethoscope size={22} className="text-blue-500" />
              Manage Medicines
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/payment-history"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ''}`
              }
            >
              <History size={22} className="text-blue-500" />
              Payment History
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/ask-for-advertisement"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ''}`
              }
            >
              <BadgeDollarSign size={22} className="text-blue-500" />
              Ask For Advertisement
            </NavLink>
          </li>
          <div className={divider}></div>
        </>
      )}
      {role === 'user' && (
        <>
          <li className={sectionHeader}>User Panel</li>
        </>
      )}
      <div className="flex-1" />
      <li className="mt-4 px-5">
        <button
          onClick={handleSignOut}
          className={`${linkClass} w-full text-left`}
        >
          <LogOut size={22} className="text-blue-500" />
          Logout
        </button>
      </li>
    </ul>
  );
};

export default Links;
