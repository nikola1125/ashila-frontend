import { useQuery } from '@tanstack/react-query'
import React, { useContext } from 'react'
import { AuthContext } from '../../../../Context/Auth/AuthContext'
import useAxiosSecure from '../../../../hooks/useAxiosSecure'

import LoadingError from '../../../../Components/Common/States/LoadingError'
import EmptyArray from '../../../../Components/Common/States/EmptyArray'
import DataLoading from '../../../../Components/Common/Loaders/DataLoading'
import { useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const SellerDashboard = () => {
  const location = useLocation()
  const { user } = useContext(AuthContext)
  const { privateApi } = useAxiosSecure()

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['seller-dashboard-data', user?.email],
    queryFn: () => privateApi.get(`/orders/stats/${user?.email}`),
  })

  if (isLoading) return <DataLoading label="dashboard data" />;
  if (isError) return <LoadingError label="dashboard data" showAction={true} />;

  // If data is empty or missing
  const stats = Array.isArray(data) && data.length > 0 ? data[0] : null;
  if (!stats) {
    return <EmptyArray message="No dashboard data found" />;
  }

  return (
    <div className="p-4 md:p-8">
      <Helmet key={location.pathname}>
        <title>Seller Dashboard</title>
      </Helmet>
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">Seller Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border-t-4 border-blue-500">
          <div className="text-blue-500 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
          </div>
          <div className="text-3xl font-bold">{stats.totalOrders}</div>
          <div className="text-gray-500 mt-1">Total Orders</div>
        </div>
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border-t-4 border-stone-500">
          <div className="text-stone-500 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.333-2-4-2-4 0s2.667 4 4 4 4-2 4-4-2.667-4-4-4z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v2m0 0h-2m2 0h2" /></svg>
          </div>
          <div className="text-3xl font-bold">{stats.totalRevenue.toLocaleString()} ALL</div>
          <div className="text-gray-500 mt-1">Total Revenue</div>
        </div>
        {/* Paid Amount */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border-t-4 border-emerald-500">
          <div className="text-emerald-500 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2M5 12h14v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7z" /></svg>
          </div>
          <div className="text-3xl font-bold">{stats.paidAmount.toLocaleString()} ALL</div>
          <div className="text-gray-500 mt-1">Paid Amount</div>
        </div>
        {/* Pending Amount */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center border-t-4 border-yellow-500">
          <div className="text-yellow-500 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
          </div>
          <div className="text-3xl font-bold">{stats.pendingAmount.toLocaleString()} ALL</div>
          <div className="text-gray-500 mt-1">Pending Amount</div>
        </div>
      </div>
    </div>
  )
}

export default SellerDashboard
