import Sidebar from "../layout/Sidebar";
import { Outlet } from "react-router-dom";

function AppLayout() {
  return (
    <div className="flex h-screen bg-[#0B1220] text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-5">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
