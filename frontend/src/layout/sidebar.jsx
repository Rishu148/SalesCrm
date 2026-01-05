import {
  LayoutDashboard,
  Users,
  GitBranch,
  DollarSign,
  CheckSquare,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Contacts", icon: Users, path: "/contacts" },
    { name: "Pipeline", icon: GitBranch, path: "/pipeline" },
    { name: "Revenue", icon: DollarSign, path: "/revenue" },
    { name: "Tasks", icon: CheckSquare, path: "/tasks" },
  ];

  return (
    <aside className="w-64 h-screen bg-[#0F172A] border-r border-white/10 p-5 flex flex-col">
      
      {/* ================= TOP ================= */}
      <div>
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-10">
          <img
            src="https://i.imgur.com/6X4Hq7K.png"
            className="w-9 h-9 rounded-full"
            alt="logo"
          />
          <span className="text-xl font-semibold">SalesCRM</span>
        </div>

        {/* NAV */}
        <nav className="space-y-2">
          {menu.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <div
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
                  ${
                    active
                      ? "bg-blue-600/20 text-blue-400"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
              >
                <Icon size={18} />
                {item.name}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ================= BOTTOM (FIXED) ================= */}
      <div className="mt-auto border-t border-white/10 pt-4 space-y-4">
        
        {/* SETTINGS */}
        <div
          onClick={() => navigate("/settings")}
          className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-gray-300 hover:bg-white/5"
        >
          <Settings size={18} />
          Settings
        </div>

        {/* PROFILE */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            className="w-10 h-10 rounded-full"
            alt="profile"
          />
          <div>
            <p className="font-semibold text-sm">Alex Morgan</p>
            <p className="text-xs text-gray-400">Sales Lead</p>
          </div>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;
