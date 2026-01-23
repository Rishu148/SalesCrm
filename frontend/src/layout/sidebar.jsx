import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  DollarSign,
  CheckSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PieChart
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const menu = [
    ...(user?.role === "user" ? [{ name: "Home", icon: LayoutDashboard, path: "/home" }] : []),
    ...(user?.role === "admin" ? [{ name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }] : []),
    { name: "Contacts", icon: Users, path: "/contacts" },
    { name: "Pipeline", icon: GitBranch, path: "/pipeline" },
    
  ];

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 🛑 Main Aside: Overflow VISIBLE rakha hai taaki Button kate nahi */}
      <aside 
        className={`h-screen bg-[#0f172a] flex flex-col border-r border-slate-800 transition-all duration-300 relative z-50 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        
        {/* 🟢 TOGGLE BUTTON (Ab Pura Dikhega) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-1 border-2 border-[#0f172a] shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all z-[100] cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* ================= TOP LOGO (Click to Collapse) ================= */}
        <div className={`flex items-center gap-3 p-5 mb-2 ${isCollapsed ? "justify-center" : ""}`}>
          <div 
              onClick={() => setIsCollapsed(!isCollapsed)} // 👈 CLICK TO TOGGLE
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer shrink-0 hover:scale-105 transition-transform"
              title="Toggle Sidebar"
          >
            <PieChart className="text-white" size={20} />
          </div>
          
          {/* Text Container with overflow hidden */}
          <div 
            className={`overflow-hidden transition-all duration-200 cursor-pointer ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
            onClick={() => setIsCollapsed(!isCollapsed)} // 👈 Click text to toggle too
          >
            <h1 className="font-bold text-white text-lg tracking-tight whitespace-nowrap">SalesCRM</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Workspace</p>
          </div>
        </div>

        {/* ================= MENU LINKS ================= */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          {menu.map((item) => {
            const active = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <div key={item.name} className="relative group">
                  <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                          ${active 
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25" 
                              : "text-slate-400 hover:bg-slate-800 hover:text-white"
                          }
                          ${isCollapsed ? "justify-center" : ""}
                      `}
                  >
                      <Icon size={20} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
                      
                      <span className={`font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                          isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
                      }`}>
                          {item.name}
                      </span>
                  </button>

                  {/* Tooltip on Collapse */}
                  {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-slate-700/50">
                          {item.name}
                          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-700/50"></div>
                      </div>
                  )}
              </div>
            );
          })}
        </nav>

        {/* ================= BOTTOM PROFILE ================= */}
        <div className="p-3 border-t border-slate-800 bg-[#0f172a] overflow-hidden">
          
          <button
              onClick={() => navigate("/settings")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all mb-1 group relative ${isCollapsed ? "justify-center" : ""}`}
          >
              <Settings size={20} className="shrink-0" />
              <span className={`font-medium text-sm whitespace-nowrap transition-all ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}>Settings</span>
              
              {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-slate-700/50 whitespace-nowrap">
                      Settings
                  </div>
              )}
          </button>

          <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 ${isCollapsed ? "justify-center bg-transparent border-0 p-0" : ""}`}>
              <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                      {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></div>
              </div>

              <div className={`overflow-hidden transition-all duration-200 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}>
                  <p className="text-sm font-bold text-white truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user?.email}</p>
              </div>

              {!isCollapsed && (
                  <button onClick={handleLogout} className="ml-auto p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Logout">
                      <LogOut size={16} />
                  </button>
              )}
          </div>

          {/* Logout for Collapsed Mode */}
          {isCollapsed && (
               <button onClick={handleLogout} className="w-full flex justify-center p-3 mt-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all group relative">
                  <LogOut size={20} />
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-red-900/90 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-red-700/50">
                      Logout
                  </div>
               </button>
          )}

        </div>
      </aside>
    </>
  );
}

export default Sidebar;