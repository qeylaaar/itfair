import React, { useContext } from "react";
import type { ReactNode } from "react"; // Diperbaiki: Impor 'ReactNode' sebagai tipe
import { Navigate } from "react-router-dom";
// Path diubah untuk mencoba resolusi dari root (jika 'context' ada di luar 'src')
import { AuthContext } from "../context/AuthContext";
import Loading from "../components/Loading"

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "user";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loading/>
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;