import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/Auth/AuthContext";
import DataLoading from "../Components/Common/Loaders/DataLoading";

const PrivateRoute = ({ children }) => {
  const {pathname} = useLocation()
  const { user, isUserLoading } = useContext(AuthContext);
  if (isUserLoading) {
    return <DataLoading />;
  } else {
    if (user) {
      return children;
    } else {
      return <Navigate state={pathname} to="/login" replace />;
    }
  }
};

export default PrivateRoute;
