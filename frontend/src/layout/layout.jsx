import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext"; // Path check kar lena

function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-[#0B1220] text-white font-sans">
      {/* MAGIC FIX: key={user?.role} 
        Jab role change hoga, React sidebar ko destroy karke recreate karega.
        Refresh karne ki zaroorat nahi padegi.
      */}
      <Sidebar key={user?.role || "guest"} />
      
      <main className="flex-1 overflow-y-auto bg-[#0B1220]">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;