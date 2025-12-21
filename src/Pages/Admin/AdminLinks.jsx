import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  BarChart2,
  Megaphone,
  Star,
  LogOut,
  Home,
} from 'lucide-react';
import { AuthContext } from '../../Context/Auth/AuthContext';
import { toast } from 'react-toastify';

const linkClass =
  'flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-200 hover:bg-amber-100/70 hover:text-amber-900 font-medium text-amber-900/90 text-base shadow-sm';
const activeClass = 'bg-amber-200/70 text-amber-950 shadow-inner font-semibold';
const sectionHeader =
  'uppercase text-xs tracking-widest text-amber-500 font-bold px-5 pt-6 pb-2';
const divider = 'my-2 border-t border-amber-100';

const AdminLinks = () => {
  const { signOutUser } = useContext(AuthContext);

  const handleSignOut = () => {
    signOutUser()
      .then(() => {
        toast.success('LogOut successful');
      })
      .catch((err) => console.log(err.message));
  };

  return (
    <ul className="flex flex-col gap-1 h-full">
      <li className={sectionHeader}>Main</li>
      <li>
        <NavLink
          to="/"
          className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
        >
          <Home size={22} className="text-amber-600" />
          Home
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
        >
          <LayoutDashboard size={22} className="text-amber-600" />
          Admin Dashboard
        </NavLink>
      </li>
      <div className={divider}></div>

      <li className={sectionHeader}>Management</li>
      <li>
        <NavLink
          to="/admin/manage-products"
          className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
        >
          <FolderKanban size={22} className="text-amber-600" />
          Products
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/admin/manage-bestsellers"
          className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
        >
          <Star size={22} className="text-amber-600" />
          Best Sellers
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/admin/inventory"
          className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
        >
          <BarChart2 size={22} className="text-amber-600" />
          Inventory
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
        >
          <CreditCard size={22} className="text-amber-600" />
          Orders
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/admin/economy"
          className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
        >
          <Megaphone size={22} className="text-amber-600" />
          Economy
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/admin/manage-users"
          className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
        >
          <Users size={22} className="text-amber-600" />
          Users
        </NavLink>
      </li>

      <div className={divider}></div>

      <div className="flex-1" />
      <li className="mt-4 px-5">
        <button onClick={handleSignOut} className={`${linkClass} w-full text-left`}>
          <LogOut size={22} className="text-amber-600" />
          Logout
        </button>
      </li>
    </ul>
  );
};

export default AdminLinks;
