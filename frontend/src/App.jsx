import { Routes, Route, Navigate } from "react-router-dom";

// Auth & Layout
import ProtectedRoute from "./pages/ProtectedRoute"; // Check path
import Layout from "./layout/layout"; // Check path
import Login from "./login";
import Register from "./register";
import NotFound from "./pages/NotFound";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Pipeline from "./pages/Pipeline";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= PROTECTED APP ROUTES ================= */}
      {/* Sidebar Layout + Security Check */}
      <Route element={<Layout />}>
        
        {/* ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

       
        <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
          <Route path="/home" element={<Home />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

      </Route>

      {/* ================= 404 CATCH ALL ================= */}
    
     <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;