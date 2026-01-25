import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutGrid, Users, Briefcase, RefreshCw, 
  LogOut, Power, UserPlus, Activity, 
  Terminal, ShieldCheck, Cpu, HardDrive, Network,
  Search, ChevronRight, Lock
} from "lucide-react";
import { useAuth } from "../context/authContext";

export default function CommandDeck() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Real System Stats (Simulation)
  const [sysStats, setSysStats] = useState({ ping: 12, mem: 40 });

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  // 🎨 THEME: "Neon Glass" aesthetic
  // Admin = Rose/Fuchsia (Powerful & Distinct)
  // User = Cyan/Blue (Tech & Calm)
  const theme = {
    primary: isAdmin ? "text-rose-400" : "text-cyan-400",
    secondary: isAdmin ? "text-rose-500/60" : "text-cyan-500/60",
    border: isAdmin ? "border-rose-500/20" : "border-cyan-500/20",
    bgHover: isAdmin ? "bg-rose-500/10" : "bg-cyan-500/10",
    glow: isAdmin ? "shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)]" : "shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)]",
    caret: isAdmin ? "caret-rose-500" : "caret-cyan-500",
    bar: isAdmin ? "bg-rose-500" : "bg-cyan-500"
  };

  // 🛠️ SMART COMMANDS
  const commands = useMemo(() => {
    
    // Main Entry Logic
    const mainEntry = isAdmin 
      ? { 
          id: "dash", label: "Dashboard", sub: "Global Overview", 
          icon: <LayoutGrid size={18} />, tag: "Root", 
          action: () => navigate("/dashboard"), 
          meta: { path: "/dashboard", access: "Full Access", type: "View" }
        }
      : { 
          id: "home", label: "Home", sub: "Personal Space", 
          icon: <LayoutGrid size={18} />, tag: "Home", 
          action: () => navigate("/home"),
          meta: { path: "/home", access: "Read Only", type: "View" }
        };

    const common = [
      mainEntry,
      { 
        id: "pipe", label: "Pipeline", sub: "Manage Deals", 
        icon: <Briefcase size={18} />, tag: "App", 
        action: () => navigate("/pipeline"),
        meta: { path: "/pipeline", access: "Shared", type: "Kanban" }
      },
      { 
        id: "cont", label: "Contacts", sub: "Lead Database", 
        icon: <Users size={18} />, tag: "Data", 
        action: () => navigate("/contacts"),
        meta: { path: "/contacts", access: "Shared", type: "Table" }
      },
      { 
        id: "refresh", label: "Reboot System", sub: "Reload Data", 
        icon: <RefreshCw size={18} />, tag: "Sys", 
        action: () => window.location.reload(),
        meta: { path: "window.reload()", access: "Local", type: "Function" }
      },
    ];

    const adminOnly = [
      { 
        id: "team", label: "Manage Team", sub: "Users & Roles", 
        icon: <UserPlus size={18} />, tag: "Admin", 
        action: () => navigate("/settings", { state: { activeTab: "team" } }), 
        meta: { path: "/settings?tab=team", access: "Root Only", type: "Config" }
      }
    ];

    const userOnly = [
      { 
        id: "stats", label: "My Stats", sub: "Performance", 
        icon: <Activity size={18} />, tag: "Me", 
        action: () => navigate("/settings", { state: { activeTab: "achievements" } }),
        meta: { path: "/settings?tab=rank", access: "Private", type: "Stats" }
      }
    ];

    const terminate = [
        { 
          id: "logout", label: "Disconnect", sub: "End Session", 
          icon: <Power size={18} />, tag: "Exit", 
          action: () => logout(), type: "critical",
          meta: { path: "auth.logout()", access: "Public", type: "Kill" }
        }
    ];

    let baseCommands = isAdmin ? [...common, ...adminOnly] : [...common, ...userOnly];
    return [...baseCommands, ...terminate];

  }, [isAdmin, navigate, logout]);

  // 🔍 FILTERING
  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    return commands.filter(c => 
      c.label.toLowerCase().includes(query.toLowerCase()) || 
      c.tag.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, commands]);

  // ⌨️ CONTROLS
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape") setOpen(false);

      if (open) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex(i => (i + 1) % filteredCommands.length);
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
        }
        if (e.key === "Enter") {
          e.preventDefault();
          const item = filteredCommands[selectedIndex];
          if (item) {
            item.action();
            setOpen(false);
          }
        }
      }
    };
    
    const interval = setInterval(() => {
        setSysStats({ 
            ping: Math.floor(Math.random() * 20) + 10,
            mem: Math.floor(Math.random() * 15) + 30
        });
    }, 2000);

    window.addEventListener("keydown", handleKeyDown);
    return () => {
        window.removeEventListener("keydown", handleKeyDown);
        clearInterval(interval);
    };
  }, [open, filteredCommands, selectedIndex]);

  if (!open) return null;

  const activeItem = filteredCommands[selectedIndex];
  const isCritical = activeItem?.type === "critical";

  return (
    <div className="fixed inset-0 z-[9999] bg-[#000]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setOpen(false)}>
      
      {/* 🔮 HUD CONTAINER */}
      <div 
        className={`w-full max-w-2xl bg-[#08080a] border rounded-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200 shadow-2xl ${isCritical ? "border-red-500/40 shadow-red-900/20" : `${theme.border} ${theme.glow}`}`}
        onClick={e => e.stopPropagation()}
      >
        
        {/* ✨ SEARCH INPUT (Cleaner Look) */}
        <div className="flex items-center px-6 py-5 border-b border-white/5 bg-white/[0.01] relative">
            <Search size={20} className={`mr-4 ${isCritical ? "text-red-500" : "text-slate-500"}`} />
            
            <input 
                autoFocus
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                placeholder="Type to execute..." 
                className={`flex-1 bg-transparent text-xl text-white outline-none font-sans font-medium placeholder:text-slate-700 tracking-wide ${theme.caret}`}
            />
            
            {/* Corner Stats */}
            <div className="flex gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
               <span className="flex items-center gap-1"><Cpu size={10}/> {sysStats.mem}%</span>
               <span className="flex items-center gap-1"><Network size={10}/> {sysStats.ping}ms</span>
            </div>
        </div>

        {/* 🪟 SPLIT BODY */}
        <div className="flex h-[340px]">
            
            {/* 📜 LEFT: LIST (Clean Typography) */}
            <div className="w-[55%] border-r border-white/5 overflow-y-auto custom-scrollbar p-2">
                {filteredCommands.map((item, index) => {
                    const isActive = index === selectedIndex;
                    return (
                        <div 
                            key={item.id}
                            onMouseEnter={() => setSelectedIndex(index)}
                            onClick={() => { item.action(); setOpen(false); }}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 group mb-1 relative overflow-hidden ${
                                isActive 
                                ? (item.type === "critical" ? "bg-red-500/10 text-red-400" : `${theme.bgHover} text-white`) 
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            {/* Active Indicator Bar */}
                            {isActive && (
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.type === "critical" ? "bg-red-500" : theme.bar}`}></div>
                            )}

                            <div className="flex items-center gap-3 pl-2">
                                <div className={`${isActive ? (item.type === "critical" ? "text-red-400" : theme.primary) : "text-slate-500"} transition-colors`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-medium tracking-wide">{item.label}</p>
                                </div>
                            </div>
                            
                            {/* Tag */}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isActive 
                                ? "bg-white/10 text-white" 
                                : "text-slate-600 bg-white/5"
                            }`}>
                                {item.tag}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* 🖼️ RIGHT: DETAILS (Cleaner & Readable) */}
            <div className="w-[45%] bg-[#030303] relative flex flex-col p-6">
                
                {/* Background Grid (Subtle) */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                
                {isCritical && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>}

                {activeItem ? (
                    <div className="relative z-10 h-full flex flex-col justify-between animate-in slide-in-from-right-4 duration-300">
                        
                        {/* Header Info */}
                        <div className="space-y-4">
                            <div className={`p-3 rounded-2xl w-fit ${
                                isCritical ? "bg-red-500/10 text-red-500 border border-red-500/20" : `bg-white/5 ${theme.primary} border border-white/10`
                            }`}>
                                {activeItem.icon}
                            </div>
                            
                            <div>
                                <h3 className={`text-xl font-bold ${isCritical ? "text-red-500" : "text-white"}`}>
                                    {activeItem.label}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    {activeItem.sub}
                                </p>
                            </div>
                        </div>

                        {/* 📊 Technical Details Grid */}
                        <div className="grid grid-cols-1 gap-3 border-t border-white/5 pt-4">
                            <DetailRow label="Path" value={activeItem.meta.path} theme={theme} isCritical={isCritical} />
                            <DetailRow label="Access" value={activeItem.meta.access} theme={theme} isCritical={isCritical} />
                            <DetailRow label="Type" value={activeItem.meta.type} theme={theme} isCritical={isCritical} />
                        </div>

                        {/* Execute Button Hint */}
                        <div className={`w-full py-2.5 rounded-lg border flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                            isCritical 
                            ? 'border-red-500/50 bg-red-500/10 text-red-400' 
                            : 'border-white/10 text-slate-400 bg-white/5'
                        }`}>
                            <span>Press</span>
                            <kbd className="bg-white/10 px-1 py-0.5 rounded text-white font-sans">Enter</kbd>
                            <span>to {isCritical ? "Disconnect" : "Open"}</span>
                        </div>

                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-700 text-xs font-bold uppercase tracking-widest">
                        System Ready
                    </div>
                )}
            </div>
        </div>

        {/* 🦶 FOOTER (Clean) */}
        <div className="px-5 py-3 bg-[#050505] border-t border-white/5 flex justify-between items-center text-[10px] font-medium text-slate-600">
            <span className="flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck size={12}/> Secure Connection
            </span>
            <span className="uppercase tracking-wide">
                ID: {user?._id?.slice(-6).toUpperCase() || 'UNK'}
            </span>
        </div>

      </div>
    </div>
  );
}

// Cleaner Detail Row
const DetailRow = ({ label, value, theme, isCritical }) => (
    <div className="flex justify-between items-center">
        <span className="text-[11px] text-slate-500 font-medium">{label}</span>
        <span className={`text-[11px] font-mono ${isCritical ? "text-red-400" : "text-slate-300"}`}>
            {value}
        </span>
    </div>
);