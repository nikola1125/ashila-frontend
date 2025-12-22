import React, { useContext, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AuthContext } from '../Context/Auth/AuthContext';
import Logo from '../Components/Common/Logo/Logo';
import userLogo from '../assets/userLogo.png';
import ScrollToTop from '../Components/Common/ScrollToTop';
import AdminLinks from '../Pages/Admin/AdminLinks';
import useAxiosSecure from '../hooks/useAxiosSecure';

const AdminLayout = () => {
  // const { user } = useContext(AuthContext); // Removed to prevent user profile bleeding
  const { privateApi } = useAxiosSecure();

  // --- Global Notification Logic ---
  const { data: pendingOrders = [] } = useQuery({
    queryKey: ['global-admin-pending-orders'],
    queryFn: async () => {
      const res = await privateApi.get('/orders');
      const allOrders = Array.isArray(res) ? res : (res?.data || []);
      return allOrders.filter(o => o.status === 'Pending');
    },
    refetchInterval: 3000, // Poll every 3 seconds
    refetchIntervalInBackground: true, // Continue polling even when tab is in background
    retry: false
  });

  const prevPendingCount = useRef(0);
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

  useEffect(() => {
    // If pending orders INCREASED, play sound
    if (pendingOrders.length > prevPendingCount.current) {
      audioRef.current.play().catch(e => console.warn("Audio blocked:", e));
      toast.info('New Order Received! 🔔', { position: 'top-right' });
    }
    prevPendingCount.current = pendingOrders.length;
  }, [pendingOrders.length]);
  // -------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-tr from-stone-50 via-white to-amber-50 z-50">
      <ScrollToTop />
      <div className="drawer lg:drawer-open">
        <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          {/* Mobile Sidebar Toggle - Floating */}
          <label
            htmlFor="admin-drawer"
            className="btn btn-circle btn-ghost absolute top-3 left-3 z-50 lg:hidden bg-white/50 backdrop-blur shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-6 w-6 stroke-current text-amber-900"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </label>

          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="bg-white/90 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 min-h-[70vh] overflow-x-hidden">
              <Outlet />
            </div>
          </main>
        </div>

        <div className="drawer-side">
          <label htmlFor="admin-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <aside className="menu bg-white/80 backdrop-blur border-r border-amber-100 shadow-xl min-h-full w-64 sm:w-72 lg:w-80 p-0 flex flex-col">
            <div className="p-4 sm:p-6 border-b border-amber-100 flex items-center gap-2 sm:gap-3">
              <img
                src={userLogo}
                alt="Admin"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-amber-900 text-sm sm:text-base truncate">
                  Administrator
                </div>
                <div className="text-xs text-amber-600">Admin Dashboard</div>
              </div>
            </div>

            <div className="flex-1 p-2 sm:p-4 overflow-y-auto -webkit-overflow-scrolling-touch">
              <AdminLinks />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
