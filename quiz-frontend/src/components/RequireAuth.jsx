import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RequireAuth = () => {
  const userId = localStorage.getItem("userId");
  return userId ? <Outlet /> : <Navigate to="/login" replace />;
};

export default RequireAuth;
