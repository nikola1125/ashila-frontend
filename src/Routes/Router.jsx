import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../Layouts/RootLayout';
import DashboardLayout from '../Layouts/DashboardLayout';
import AdminLayout from '../Layouts/AdminLayout';
import InvoiceLayout from '../Layouts/InvoiceLayout';

import Home from '../Pages/Home/Home';
import Shop from '../Pages/Shop/Shop';
import Login from '../Pages/Login/Login';
import SignUp from '../Pages/SignUp/SignUp';
import Profile from '../Pages/Profile/Profile';
import Cart from '../Pages/Cart/Cart';
import Checkout from '../Pages/Checkout/Checkout';
import ProductDetail from '../Pages/ProductDetail/ProductDetail';
import ContactUs from '../Pages/contact/ContactUs';
import Forbidden from '../Pages/Others/Forbidden';
import CategoryDetails from '../Pages/CategoryDetails/CategoryDetails';

import PrivateRoute from './PrivateRoute';
import SellerRoute from './SellerRoute';
import AdminTokenRoute from './AdminTokenRoute';

import DashboardRouteElement from '../Pages/Dashboard/Others/DashboardRouteElement';
import UserDashboard from '../Pages/Dashboard/User/UserDashboard/UserDashboard';
import MyPayments from '../Pages/Dashboard/User/MyPayments/MyPayments';
import ManageMedicine from '../Pages/Dashboard/Seller/ManageMedicine/ManageMedicine';
import PaymentHistory from '../Pages/Dashboard/Seller/PaymentHistory/PaymentHistory';
import AskForAdvertisement from '../Pages/Dashboard/Seller/AskForAdvertisement/AskForAdvertisement';

import AdminDashboard from '../Pages/Dashboard/Admin/AdminDashboard/AdminDashboard';
import ManageUsers from '../Pages/Dashboard/Admin/ManageUsers/ManageUsers';
import ManageCategories from '../Pages/Dashboard/Admin/ManageCategories/ManageCategories';
import ManagePayments from '../Pages/Dashboard/Admin/ManagePayments/ManagePayments';
import SalesReport from '../Pages/Dashboard/Admin/SalesReport/SalesReport';
import ManageAds from '../Pages/Dashboard/Admin/ManageAds/ManageAds';
import ManageBestsellers from '../Pages/Dashboard/Admin/ManageBestsellers/ManageBestsellers';
import ManageProducts from '../Pages/Dashboard/Admin/ManageProducts/ManageProducts';
import Inventory from '../Pages/Dashboard/Admin/Inventory/Inventory';
import OrderManagement from '../Pages/Dashboard/Admin/OrderManagement/OrderManagement';
import Economy from '../Pages/Dashboard/Admin/Economy/Economy';
import RevenueDetails from '../Pages/Dashboard/Admin/Economy/RevenueDetails';
import AdminLogin from '../Pages/Admin/AdminLogin';

import Canceled from '../Pages/Payment/Canceled';
import NotFound from '../Components/Common/States/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'shop',
        element: <Shop />,
      },
      {
        path: 'sign-up',
        element: <SignUp />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'profile',
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: 'cart',
        element: <Cart />,
      },
      {
        path: 'checkout',
        element: <Checkout />,
      },
      {
        path: 'product/:id',
        element: <ProductDetail />,
      },
      {
        path: 'product/:category/:slug',
        element: <ProductDetail />,
      },
      {
        path: 'contact-us',
        element: <ContactUs />,
      },
      {
        path: 'forbidden',
        element: <Forbidden />,
      },
      {
        path: 'category-details',
        element: <CategoryDetails />,
      },
      {
        path: 'category/:categoryName',
        element: <CategoryDetails />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <DashboardRouteElement />,
      },
      {
        path: 'user-dashboard',
        element: <UserDashboard />,
      },
      {
        path: 'my-payments',
        element: <MyPayments />,
      },
      {
        path: 'manage-medicine',
        element: (
          <SellerRoute>
            <ManageMedicine />
          </SellerRoute>
        ),
      },
      {
        path: 'payment-history',
        element: (
          <SellerRoute>
            <PaymentHistory />
          </SellerRoute>
        ),
      },
      {
        path: 'ask-for-advertisement',
        element: (
          <SellerRoute>
            <AskForAdvertisement />
          </SellerRoute>
        ),
      },
    ],
  },
  {
    path: '/admin-login',
    element: <AdminLogin />,
    errorElement: <NotFound />,
  },
  {
    path: '/admin',
    element: (
      <AdminTokenRoute>
        <AdminLayout />
      </AdminTokenRoute>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'manage-users',
        element: <ManageUsers />,
      },
      {
        path: 'manage-categories',
        element: <ManageCategories />,
      },
      {
        path: 'manage-payments',
        element: <ManagePayments />,
      },
      {
        path: 'sales-report',
        element: <SalesReport />,
      },
      {
        path: 'manage-ads',
        element: <ManageAds />,
      },
      {
        path: 'manage-bestsellers',
        element: <ManageBestsellers />,
      },
      // New Routes
      {
        path: 'manage-products',
        element: <ManageProducts />,
      },
      {
        path: 'inventory',
        element: <Inventory />,
      },
      {
        path: 'orders',
        element: <OrderManagement />,
      },
      {
        path: 'economy',
        element: <Economy />,
      },
      {
        path: 'economy/revenue-details',
        element: <RevenueDetails />,
      },
    ],
  },
  {
    path: '/payment/success',
    element: <InvoiceLayout />,
    errorElement: <NotFound />,
  },
  {
    path: '/payment/canceled',
    element: <Canceled />,
    errorElement: <NotFound />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);