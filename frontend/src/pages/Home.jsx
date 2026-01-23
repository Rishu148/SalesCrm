import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Navigation Import
import api from "../api/axios";
import { useAuth } from "../context/authContext";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  PieChart, Pie, Legend
} from "recharts";
import { 
  LayoutGrid, Phone, MessageCircle, Mail,
  CheckCircle, Clock, Briefcase, TrendingUp, Filter,
  Calendar, X, ChevronRight, Globe, Hash, Zap, Trophy, Loader2, ArrowRight
} from "lucide-react";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate(); // 👈 Navigation Hook
  const [greeting, setGreeting] = useState("Welcome");
  
  // Data States
  const [activeLeads, setActiveLeads] = useState([]);
  const [recentWins, setRecentWins] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, won: 0, conversion: 0 });
  const [chartData, setChartData] = useState([]); 
  const [sourceData, setSourceData] = useState([]); 
  
  // UI States
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Time Logic
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // 2. DATA FETCHING ENGINE
  const fetchData = useCallback(async () => {
    const userId = user?._id || user?.id;

    if (!userId) {
        if (user === null) setLoading(false); 
        return;
    }

    try {
      const res = await api.get("/leads");
      const allLeads = res.data;

      // Filter: Only My Leads
      const userLeads = allLeads.filter(lead => {
          const leadAgentId = lead.assignedTo?._id || lead.assignedTo?.id;
          return leadAgentId === userId;
      });
      
      // Active vs Closed
      const active = userLeads.filter(l => ['New', 'Contacted', 'Interested'].includes(l.status));
      const closed = userLeads.filter(l => l.status === 'Closed');
      
      // Sort Active
      const sortedActive = active.sort((a, b) => {
          const priority = { 'New': 3, 'Interested': 2, 'Contacted': 1 };
          return priority[b.status] - priority[a.status] || new Date(b.updatedAt) - new Date(a.updatedAt);
      });

      setActiveLeads(sortedActive);
      setRecentWins(closed.slice(0, 3));
      
      const total = userLeads.length;
      const winRate = total > 0 ? Math.round((closed.length / total) * 100) : 0;
      
      setStats({ total, active: active.length, won: closed.length, conversion: winRate });

      // Graphs
      const stages = ['New', 'Contacted', 'Interested', 'Closed'];
      setChartData(stages.map(stage => ({ 
          name: stage, 
          count: userLeads.filter(l => l.status === stage).length,
          fill: stage === 'Closed' ? '#10b981' : '#6366f1'
      })));

      const sources = userLeads.reduce((acc, lead) => { 
          acc[lead.source] = (acc[lead.source] || 0) + 1; 
          return acc; 
      }, {});
      setSourceData(Object.keys(sources).map(key => ({ name: key, value: sources[key] })));

    } catch (error) {
        console.error("Home Data Error:", error);
    } finally {
        setLoading(false);
    }
  }, [user]);

  // 3. TRIGGER
  useEffect(() => { 
      const userId = user?._id || user?.id;
      if (userId) fetchData(); 
  }, [user, fetchData]);

  // --- HANDLERS ---
  const handleBackdropClick = (e) => {
      if (e.target.id === "modal-backdrop") setSelectedLead(null);
  };

  const handleStatusUpdate = async (newStatus) => {
      if(!selectedLead) return;
      try {
          const updatedLead = { ...selectedLead, status: newStatus };
          setSelectedLead(updatedLead); 
          setActiveLeads(prev => prev.map(l => (l._id || l.id) === (selectedLead._id || selectedLead.id) ? updatedLead : l));
          
          const leadId = selectedLead._id || selectedLead.id;
          await api.put(`/leads/${leadId}`, { status: newStatus });
          fetchData(); 
      } catch (error) { console.error("Update failed"); }
  };

  const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  if (loading) return <HomeSkeleton />;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30 pb-12">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-30 bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <LayoutGrid size={20} className="text-white" />
            </div>
            <div>
                <h1 className="text-lg font-bold tracking-tight text-white leading-none">Sales<span className="text-indigo-400">CRM</span></h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">Agent Workspace</p>
            </div>
        </div>
        
        {/* User Profile (Clickable -> Settings) */}
        <div 
            onClick={() => navigate("/settings")} // 👈 Navigate on click
            className="flex items-center gap-4 cursor-pointer group hover:bg-white/5 p-2 rounded-xl transition-all"
        >
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{user?.name}</p>
                <div className="flex items-center justify-end gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">Online</span>
                </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 group-hover:border-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-inner transition-all">
                {user?.name?.charAt(0).toUpperCase()}
            </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 pt-10 space-y-8 animate-in fade-in duration-500">
        
        {/* HERO */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.name?.split(" ")[0]}</span>.
                </h1>
                <p className="text-slate-400">
                    You have <span className="text-white font-semibold">{stats.active} opportunities</span> requiring action today.
                </p>
            </div>
        </div>

        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="grid grid-cols-2 gap-4 lg:col-span-1">
                <StatCard label="Assigned Leads" value={stats.total} icon={<Briefcase size={18}/>} color="blue" />
                <StatCard label="Deals Won" value={stats.won} icon={<CheckCircle size={18}/>} color="emerald" />
                <StatCard label="In Pipeline" value={stats.active} icon={<Clock size={18}/>} color="amber" />
                <StatCard label="Win Rate" value={`${stats.conversion}%`} icon={<TrendingUp size={18}/>} color="purple" />
            </div>

            {/* PIPELINE CHART */}
            <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 lg:col-span-1 shadow-xl flex flex-col">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Filter size={16} className="text-indigo-400"/> Pipeline Flow
                </h3>
                <div className="flex-1 w-full min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* SOURCE CHART */}
            <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 lg:col-span-1 shadow-xl flex flex-col">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Globe size={16} className="text-emerald-400"/> Sources
                </h3>
                <div className="flex-1 w-full relative min-h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                                {sourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-8">
                        <span className="text-2xl font-bold text-white">{stats.total}</span>
                        <span className="text-[9px] text-slate-500 uppercase font-bold">Total</span>
                    </div>
                </div>
            </div>
        </div>

        {/* LISTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PRIORITY LIST */}
            <div className="lg:col-span-2 bg-[#0f172a] border border-white/5 rounded-3xl p-6 shadow-xl min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Zap size={20} className="text-yellow-400 fill-yellow-400/20"/> Action Required
                    </h3>
                    <span className="text-xs font-bold text-slate-500 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                        {activeLeads.length} Pending
                    </span>
                </div>

                <div className="space-y-3">
                    {activeLeads.length > 0 ? (
                        activeLeads.slice(0, 5).map((lead) => (
                            <div 
                                key={lead._id || lead.id} 
                                onClick={() => setSelectedLead(lead)} 
                                className="group flex items-center justify-between p-4 rounded-2xl bg-[#1e293b]/40 border border-white/5 hover:bg-[#1e293b] hover:border-indigo-500/30 transition-all cursor-pointer hover:shadow-lg hover:shadow-indigo-500/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-inner transition-transform group-hover:scale-105 ${
                                        lead.status === 'New' ? 'bg-indigo-600' : 'bg-slate-700'
                                    }`}>
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-200 text-base group-hover:text-indigo-400 transition-colors">{lead.name}</h4>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                            {lead.company && <span className="flex items-center gap-1"><Briefcase size={12}/> {lead.company}</span>}
                                            <span className="flex items-center gap-1"><Clock size={12}/> {new Date(lead.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        lead.status === 'New' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                        lead.status === 'Interested' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                        'bg-slate-700 text-slate-400 border border-slate-600'
                                    }`}>
                                        {lead.status}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <ArrowRight size={16} className="text-slate-500 group-hover:text-white"/>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                            <CheckCircle size={40} className="mx-auto text-slate-600 mb-3 opacity-50"/>
                            <p className="text-slate-500 font-medium">All caught up!</p>
                            <p className="text-xs text-slate-600">No pending leads right now.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RECENT WINS */}
            <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Trophy size={18} className="text-emerald-400"/> Recent Wins
                    </h3>
                </div>
                <div className="space-y-4">
                    {recentWins.length > 0 ? recentWins.map(lead => (
                        <div key={lead._id || lead.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-900/10 to-transparent border border-emerald-500/10 rounded-2xl hover:border-emerald-500/30 transition-all">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <CheckCircle size={18}/>
                            </div>
                            <div>
                                <p className="font-bold text-slate-200">{lead.name}</p>
                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">Closed Deal</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 opacity-50">
                            <Trophy size={32} className="mx-auto text-slate-600 mb-2"/>
                            <p className="text-xs text-slate-500">No wins yet.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>

      </div>

      {/* --- QUICK VIEW MODAL (Overlay) --- */}
      {selectedLead && (
        <div 
            id="modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 relative" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-700/50 bg-[#141b2d] flex justify-between items-start">
                    <div className="flex gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/30">
                            {selectedLead.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{selectedLead.name}</h3>
                            <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                                <Briefcase size={12}/> {selectedLead.company || "Individual Client"}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedLead(null)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all"><X size={18}/></button>
                </div>

                {/* Details */}
                <div className="p-8 space-y-8">
                    
                    {/* Status */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-3 block flex items-center gap-2"><Zap size={14} className="text-yellow-400"/> Update Pipeline Stage</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['New', 'Contacted', 'Interested', 'Closed'].map((status) => (
                                <button 
                                    key={status}
                                    onClick={() => handleStatusUpdate(status)}
                                    className={`py-2.5 rounded-xl text-[10px] font-bold border transition-all ${
                                        selectedLead.status === status 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                                    }`}
                                >
                                    {status === 'Interested' ? 'In Progress' : status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-4">
                        <ActionButton icon={<Phone size={20}/>} label="Call" href={`tel:${selectedLead.phone}`} color="blue" />
                        <ActionButton icon={<Mail size={20}/>} label="Email" href={`mailto:${selectedLead.email}`} color="purple" />
                        <ActionButton icon={<MessageCircle size={20}/>} label="WhatsApp" href={`https://wa.me/${selectedLead.phone}`} color="green" />
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Lead Source</span>
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-300 font-medium"><Globe size={14} className="text-indigo-400"/> {selectedLead.source}</div>
                        </div>
                        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">System ID</span>
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-300 font-mono"><Hash size={14} className="text-slate-500"/> {(selectedLead._id || selectedLead.id).slice(-6)}</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      )}

    </div>
  );
}

// --- COMPONENTS ---
const StatCard = ({ label, value, icon, color }) => {
    const theme = {
        blue: "text-blue-400 bg-blue-400/10",
        emerald: "text-emerald-400 bg-emerald-400/10",
        purple: "text-purple-400 bg-purple-400/10",
        amber: "text-amber-400 bg-amber-400/10",
    };
    return (
        <div className="bg-[#0f172a] border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all flex flex-col justify-between h-32 group hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${theme[color]} transition-transform group-hover:scale-110`}>{icon}</div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{label}</p>
            </div>
        </div>
    );
};

const ActionButton = ({ icon, label, color, href }) => {
    const theme = {
        blue: "hover:bg-blue-600 hover:border-blue-600 text-blue-400 hover:text-white border-blue-500/20 bg-blue-500/5",
        purple: "hover:bg-purple-600 hover:border-purple-600 text-purple-400 hover:text-white border-purple-500/20 bg-purple-500/5",
        green: "hover:bg-emerald-600 hover:border-emerald-600 text-emerald-400 hover:text-white border-emerald-500/20 bg-emerald-500/5",
    };
    return (
        <a href={href} target="_blank" rel="noreferrer" className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all active:scale-95 ${theme[color]}`}>
            {icon}
            <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
        </a>
    );
};

// --- SKELETON ---
const HomeSkeleton = () => (
    <div className="min-h-screen bg-[#020617] p-8 space-y-8">
        <div className="flex justify-between items-center">
             <div className="h-10 w-48 bg-slate-800 rounded-xl animate-pulse"></div>
             <div className="h-10 w-12 bg-slate-800 rounded-full animate-pulse"></div>
        </div>
        <div className="h-20 w-1/3 bg-slate-800 rounded-2xl animate-pulse mb-8"></div>
        <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-800/50 rounded-3xl animate-pulse"></div>)}
        </div>
        <div className="grid grid-cols-3 gap-6 h-[300px]">
            <div className="col-span-2 bg-slate-800/50 rounded-3xl animate-pulse"></div>
            <div className="bg-slate-800/50 rounded-3xl animate-pulse"></div>
        </div>
    </div>
);

export default Home;