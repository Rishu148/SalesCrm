import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext"; // Path check karlena
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Loading State
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0B1220] text-white">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  // 2. Agar User Login hi nahi hai -> Login page bhejo
  if (!user) {
    // state={{ from: location }} isliye taaki login ke baad wapas wahin aaye jahan jana chahta tha
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. ROLE CHECKING (Enhanced Logic) 🛡️
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    
    // Agar banda ADMIN hai aur access nahi hai (matlab wo /home try kar raha hai)
    if (user.role === "admin") {
      return <Navigate to="/dashboard" replace />;
    }

    // Agar banda USER hai aur access nahi hai (matlab wo /dashboard try kar raha hai)
    if (user.role === "user") {
      return <Navigate to="/home" replace />;
    }
  }

  // 4. Sab sahi hai -> Page dikhao
  return <Outlet />;
};

export default ProtectedRoute;