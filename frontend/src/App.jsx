import { useState, useEffect } from "react"; 
import { Routes, Route, Navigate } from "react-router-dom";
import LoadingScreen from "./pages/LoadingScreen"; 
import ProtectedRoute from "./pages/ProtectedRoute"; 
import Layout from "./layout/layout"; 
import Login from "./login";
import Register from "./register";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Pipeline from "./pages/Pipeline";
import Settings from "./pages/Settings";

function App() {
  // 🔄 LOGIC: 
  // Agar session storage mein 'boot_played' nahi hai, toh ye FIRST VISIT hai.
  // Tab loading TRUE hoga aur animation chalega.
  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem("boot_played");
  });

  const handleAnimationComplete = () => {
    setLoading(false);
    // 🚩 Flag set kar diya taaki agli baar Refresh karne par bore na kare
    sessionStorage.setItem("boot_played", "true");
  };

  if (loading) {
    return <LoadingScreen onComplete={handleAnimationComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Login Page ke andar humne alag se loader lagaya hai jo button click pe chalta hai */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/home" element={<Home />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;