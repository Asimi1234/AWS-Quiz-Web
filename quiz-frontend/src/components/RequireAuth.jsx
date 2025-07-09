import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import jwt_decode from "jwt-decode";

const RequireAuth = () => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000; // in seconds
    if (decoded.exp < currentTime) {
      // Token expired — redirect to login
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    // Invalid token format — clear and redirect
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
