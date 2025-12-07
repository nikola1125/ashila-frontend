import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../Layouts/RootLayout';
import Home from '../Pages/Home/Home';
import SignUp from '../Pages/SignUp/SignUp';
import Forbidden from '../Pages/Others/Forbidden';
import DashboardLayout from '../Layouts/DashboardLayout';
import ManageCategories from '../Pages/Dashboard/Admin/ManageCategories/ManageCategories';
import Login from '../Pages/Login/Login';
import ManageUsers from '../Pages/Dashboard/Admin/ManageUsers/ManageUsers';
import ManageMedicine from '../Pages/Dashboard/Seller/ManageMedicine/ManageMedicine';
import CategoryDetails from '../Pages/CategoryDetails/CategoryDetails';
import Shop from '../Pages/Shop/Shop';
import Cart from '../Pages/Cart/Cart';
import Canceled from '../Pages/Payment/Canceled';
import InvoiceLayout from '../Layouts/InvoiceLayout';
import ManagePayments from '../Pages/Dashboard/Admin/ManagePayments/ManagePayments';
import UserDashboard from '../Pages/Dashboard/User/UserDashboard/UserDashboard';
import DashboardRouteElement from '../Pages/Dashboard/Others/DashboardRouteElement';
import PaymentHistory from '../Pages/Dashboard/Seller/PaymentHistory/PaymentHistory';
import SalesReport from '../Pages/Dashboard/Admin/SalesReport/SalesReport';
import ManageBestsellers from '../Pages/Dashboard/Admin/ManageBestsellers/ManageBestsellers';
import AdminRoute from './AdminRoute';
import SellerRoute from './SellerRoute';
import PrivateRoute from './PrivateRoute';
import Profile from '../Pages/Profile/Profile';
import ProductDetail from '../Pages/ProductDetail/ProductDetail';
import NotFound from '../Components/Common/States/NotFound'
import ContactUs from '../Pages/contact/ContactUs';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
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
        path: 'product/:id',
        element: <ProductDetail />,
      },
      {
        path: 'details',
        element: <CategoryDetails />,
      },
      {
        path: 'cart',
        element: (
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        ),
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
        path: 'canceled',
        element: (
          <PrivateRoute>
            <Canceled />
          </PrivateRoute>
        ),
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
        path: 'forbidden',
        element: <Forbidden />,
      },
      {
        path: 'contact-us',
        element: <ContactUs />
      }
    ],
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardRouteElement />,
      },
      {
        path: 'manage-categories',
        element: (
          <AdminRoute>
            <ManageCategories />
          </AdminRoute>
        ),
      },
      {
        path: 'manage-payments',
        element: (
          <AdminRoute>
            <ManagePayments />
          </AdminRoute>
        ),
      },
      {
        path: 'manage-users',
        element: (
          <AdminRoute>
            <ManageUsers />
          </AdminRoute>
        ),
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
        path: 'sales-report',
        element: (
          <AdminRoute>
            <SalesReport />
          </AdminRoute>
        ),
      },
      {
        path: 'manage-bestsellers',
        element: (
          <AdminRoute>
            <ManageBestsellers />
          </AdminRoute>
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
        path: 'user-dashboard',
        element: (
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: '/complete',
    element: (
      <PrivateRoute>
        <InvoiceLayout />
      </PrivateRoute>
    ),
  },
  // Add this catch-all route for 404
  {
    path: '*',
    element: <NotFound />,
  },
]);
