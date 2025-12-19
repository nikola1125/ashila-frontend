import React from 'react';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../../Components/Common/ScrollToTop';
import AdminV2Sidebar from './AdminV2Sidebar';

const AdminV2Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-stone-50 via-white to-amber-50">
      <ScrollToTop />
      <div className="drawer lg:drawer-open">
        <input id="admin-v2-drawer" type="checkbox" className="drawer-toggle" />

        <div className="drawer-content flex flex-col">
          <div className="navbar bg-white/80 backdrop-blur shadow-md rounded-b-2xl w-full px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex-none lg:hidden">
              <label
                htmlFor="admin-v2-drawer"
                aria-label="open sidebar"
                className="btn btn-square btn-ghost min-h-[44px] min-w-[44px]"
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
              <div className="text-sm sm:text-base font-extrabold tracking-wide text-amber-950">
                Admin Panel
              </div>
            </div>
          </div>

          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="bg-white/90 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 min-h-[70vh] overflow-x-hidden">
              <Outlet />
            </div>
          </main>
        </div>

        <div className="drawer-side">
          <label htmlFor="admin-v2-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <AdminV2Sidebar />
        </div>
      </div>
    </div>
  );
};

export default AdminV2Layout;
