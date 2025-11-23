import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import NotFound from "../pages/User/NotFound";
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Unauthorized from '../pages/User/Unauthorized';
import Loading from "../components/Loading"
import PredictionPage from "@/pages/User/Prediction";
import PredictionDetailPage from "@/pages/User/PredictionDetailPage";
import AdminLayout from "../layouts/AdminLayout";



const Home = lazy(() => import("../pages/index"));
const SignIn = lazy(() => import("../pages/Login"));
const SignUp = lazy(() => import("../pages/Register"));


const AppRoutes = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
            <Routes>
              {/* public pages */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route
                index
                element={
                  <MainLayout>
                    {/* <ProtectedRoute requiredRole="user">
                    </ProtectedRoute> */}
                    <Home />
                  </MainLayout>
                }
              />
              <Route path="/home" element={<Navigate to="/" replace />} />
              {/* public pages */}
              <Route
                path="/login"
                element={
                    <SignIn />
                }
              />
              <Route
                path="/register"
                element={
                    <SignUp />
                }
              />
              <Route
                path="/prediction"
                element={
                  <MainLayout>
                    {/* <ProtectedRoute requiredRole="user">
                    </ProtectedRoute> */}
                    <PredictionPage />
                  </MainLayout>
                }
              />
              <Route
                path="/prediction/:id"
                element={
                  <MainLayout>
                    {/* <ProtectedRoute requiredRole="user">
                    </ProtectedRoute> */}
                    <PredictionDetailPage />
                  </MainLayout>
                }
              />
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
              <Route path="/loading" element={<Loading />} />{" "}
            </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;
