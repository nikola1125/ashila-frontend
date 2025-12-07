import React, { useContext } from 'react';
import Links from '../Pages/Dashboard/Others/Links';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../Context/Auth/AuthContext';
import Logo from '../Components/Common/Logo/Logo';

const DashboardLayout = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-100 z-50">
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          {/* Navbar */}
          <div className="navbar bg-white/80 backdrop-blur shadow-md rounded-b-2xl w-full px-6 py-3 flex items-center justify-between">
            <div className="flex-none lg:hidden">
              <label
                htmlFor="my-drawer-2"
                aria-label="open sidebar"
                className="btn btn-square btn-ghost"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block h-6 w-6 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </label>
            </div>
            <div className="w-full flex justify-center">
              <Logo />
            </div>
          </div>
          {/* Page content here */}
          <main className="flex-1 p-4 md:p-8">
            <div className="bg-white/90 rounded-3xl shadow-lg p-6 min-h-[70vh]">
              <Outlet />
            </div>
          </main>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-2"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <aside className="menu bg-white/80 backdrop-blur border-r border-blue-100 shadow-xl min-h-full w-80 p-0 flex flex-col">
            <div className="p-6 border-b border-blue-100 flex items-center gap-3">
              <img
                src={user?.photoURL || '/src/assets/userLogo.png'}
                alt="User"
                className="w-12 h-12 rounded-full shadow object-cover"
              />
              <div>
                <div className="font-semibold text-blue-900">
                  {user?.displayName || 'Welcome!'}
                </div>
                <div className="text-xs text-blue-500">Your Dashboard</div>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <Links />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
