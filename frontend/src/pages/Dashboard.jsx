import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/authContext";
import {
  PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  LayoutGrid, Users, Briefcase, CheckCircle2,
  Activity, Bell, Clock, AlertCircle, BarChart3, UserCheck, Calendar
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // States
  const [stats, setStats] = useState({ total: 0, active: 0, closed: 0, unassigned: 0 });
  const [pipelineData, setPipelineData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [agentWorkload, setAgentWorkload] = useState([]);
  const [greeting, setGreeting] = useState("Hello");

  // 🕒 Time-Based Greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // 🔄 Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/leads");
        const allLeads = res.data;

        // 1. Stats
        const closedCount = allLeads.filter(l => l.status === 'Closed').length;
        const activeCount = allLeads.filter(l => ['New', 'Contacted', 'Interested'].includes(l.status)).length;
        const unassignedCount = allLeads.filter(l => !l.assignedTo).length;
        
        setStats({
            total: allLeads.length,
            active: activeCount,
            closed: closedCount,
            unassigned: unassignedCount
        });

        // 2. Pipeline
        const stages = [
            { name: 'New', color: '#3b82f6' },       // Blue
            { name: 'Contacted', color: '#f59e0b' }, // Amber
            { name: 'Interested', color: '#8b5cf6' },// Purple
            { name: 'Closed', color: '#10b981' }     // Green
        ];
        
        const pipeline = stages.map(stage => ({
            name: stage.name,
            count: allLeads.filter(l => l.status === stage.name).length,
            fill: stage.color
        }));
        setPipelineData(pipeline);

        // 3. Sources
        const sources = allLeads.reduce((acc, lead) => {
            acc[lead.source] = (acc[lead.source] || 0) + 1;
            return acc;
        }, {});
        setSourceData(Object.keys(sources).map(key => ({ name: key, value: sources[key] })));

        // 4. Activity
        const activity = [...allLeads].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
        setRecentActivity(activity);

        // 5. Workload
        const workloadMap = {};
        allLeads.forEach(lead => {
            if (lead.assignedTo && ['New', 'Contacted', 'Interested'].includes(lead.status)) {
                const name = lead.assignedTo.name;
                workloadMap[name] = (workloadMap[name] || 0) + 1;
            }
        });
        const workload = Object.keys(workloadMap)
            .map(name => ({ name, count: workloadMap[name] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        setAgentWorkload(workload);

        setLoading(false);
      } catch (error) { console.error("Load Failed"); setLoading(false); }
    };
    fetchData();
  }, []);

  const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30 pb-12">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-30 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        
        <div 
            onClick={() => navigate("/settings")} 
            className="flex items-center gap-3 cursor-pointer group p-1.5 -ml-2 rounded-xl hover:bg-white/5 transition-all"
        >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
                <h1 className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                    {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.name?.split(' ')[0]}</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Admin Dashboard</p>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
             {stats.unassigned > 0 && (
                <div className="hidden md:flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 animate-pulse">
                    <AlertCircle size={14} className="text-red-400"/>
                    <span className="text-xs font-bold text-red-400">{stats.unassigned} Unassigned</span>
                </div>
            )}
            <div className="hidden md:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <Calendar size={14} className="text-indigo-400"/>
                <span className="text-xs font-bold text-slate-300">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
            </div>
        </div>
      </header>

      {/* --- MAIN CONTENT (Wide & Compact) --- */}
      <div className="max-w-[1800px] mx-auto px-6 pt-6 space-y-6">
        
        {/* 1. KEY STATS (Compact Height) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="Total Leads" value={stats.total} icon={<Users size={18}/>} trend="Database" color="blue"/>
            <StatCard title="Active Pipeline" value={stats.active} icon={<Briefcase size={18}/>} trend="In Progress" color="amber"/>
            <StatCard title="Closed Deals" value={stats.closed} icon={<CheckCircle2 size={18}/>} trend="Success" color="emerald"/>
            <StatCard title="Unassigned" value={stats.unassigned} icon={<AlertCircle size={18}/>} trend="Attention" color={stats.unassigned > 0 ? "red" : "slate"}/>
        </div>

        {/* 2. GRAPHS (Aligned 2/3 + 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Pipeline Stages */}
            <div className="lg:col-span-2 bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Activity size={16} className="text-indigo-400"/> Pipeline Overview
                        </h3>
                    </div>
                </div>
                
                <div className="h-[280px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}> {/* 👈 Added Bottom Margin */}
                            <defs>
                                {pipelineData.map((entry, index) => (
                                    <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={entry.fill} stopOpacity={1}/>
                                        <stop offset="100%" stopColor={entry.fill} stopOpacity={0.4}/>
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            {/* 👈 Fixed XAxis Cutoff with dy */}
                            <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.03)'}}
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} 
                            />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={45}>
                                {pipelineData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} stroke={entry.fill} strokeWidth={0} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Right: Sources */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col relative overflow-hidden">
                <h3 className="text-base font-bold text-white mb-1 relative z-10">Traffic Sources</h3>
                <div className="flex-1 relative min-h-[250px] z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={sourceData} cx="50%" cy="50%" 
                                innerRadius={60} outerRadius={80} 
                                paddingAngle={5} dataKey="value" stroke="none"
                            >
                                {sourceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '10px', color: '#94a3b8'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-8">
                        <span className="text-2xl font-bold text-white tracking-tighter">{stats.total}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Leads</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. BOTTOM ROW (Scrollable Area) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            
            {/* LIVE FEED */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Bell size={16} className="text-indigo-400"/> Live Activity
                    </h3>
                    <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Updating</span>
                    </div>
                </div>
                <div className="space-y-3 relative">
                    <div className="absolute left-[15px] top-3 bottom-3 w-[1px] bg-slate-800"></div>
                    {recentActivity.map((lead, index) => (
                        <div key={lead._id} className="relative pl-10 group">
                            <div className="absolute left-[11px] top-1.5 w-2 h-2 rounded-full bg-slate-600 border border-[#0f172a] group-hover:bg-indigo-500 transition-all z-10"></div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-slate-300">
                                        <span className="font-bold text-white">{lead.name}</span> updated to 
                                        <span className={`mx-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                                            lead.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-400' : 
                                            lead.status === 'New' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-400'
                                        }`}>{lead.status}</span>
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                        <Clock size={10}/> {new Date(lead.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* TEAM WORKLOAD */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <BarChart3 size={16} className="text-blue-400"/> Team Load
                    </h3>
                </div>

                <div className="space-y-5">
                    {agentWorkload.length > 0 ? agentWorkload.map((agent, index) => (
                        <div key={index}>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-bold text-slate-200 flex items-center gap-2">
                                    <UserCheck size={12} className="text-slate-500"/> {agent.name}
                                </span>
                                <span className="text-white font-mono font-bold">{agent.count} Leads</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        agent.count > 10 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 
                                        agent.count > 5 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 
                                        'bg-gradient-to-r from-blue-500 to-cyan-500'
                                    }`} 
                                    style={{ width: `${Math.min(agent.count * 8, 100)}%` }} 
                                ></div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 opacity-50">
                            <p className="text-xs text-slate-500">No active tasks.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

// --- COMPONENTS ---

// Compact Stat Card
const StatCard = ({ title, value, icon, trend, color }) => {
    const colors = {
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        red: "bg-red-500/10 text-red-400 border-red-500/20",
        slate: "bg-slate-800 text-slate-400 border-slate-700"
    };
    return (
        
        <div className="bg-[#0f172a] border border-white/5 p-7 rounded-2xl hover:border-white/10 transition-all flex flex-col justify-between h-45 group hover:-translate-y-1 hover:shadow-lg">
            <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg ${colors[color]} transition-colors`}>{icon}</div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400`}>{trend}</span>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white tracking-tight leading-none">{value}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{title}</p>
            </div>
        </div>
    );
};

const DashboardSkeleton = () => (
    <div className="min-h-screen bg-[#020617] p-8 space-y-8">
        <div className="flex justify-between">
             <div className="h-12 w-64 bg-slate-800/50 rounded-2xl animate-pulse"></div>
             <div className="h-10 w-40 bg-slate-800/50 rounded-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-800/40 rounded-3xl animate-pulse"></div>)}
        </div>
        <div className="grid grid-cols-3 gap-8 h-[300px]">
            <div className="col-span-2 bg-slate-800/40 rounded-3xl animate-pulse"></div>
            <div className="bg-slate-800/40 rounded-3xl animate-pulse"></div>
        </div>
    </div>
);