import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Path check karlena
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // 1. Loading State (Jab tak user verify ho raha hai)
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0B1220] text-white">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  // 2. Agar User Login hi nahi hai -> Login page bhejo
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. ROLE CHECKING (Sabse Important)
  // Agar route ke liye specific roles chahiye (jaise ['admin']) aur user ke paas wo role nahi hai
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Agar user admin page access karne ki koshish kare, toh usse home bhej do
    return <Navigate to="/home" replace />;
  }

  // 4. Sab sahi hai -> Page dikhao
  // 'Outlet' ka matlab hai ki nested child routes render karo
  return <Outlet />;
};

export default ProtectedRoute;