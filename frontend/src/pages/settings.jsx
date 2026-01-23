import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/authContext";
import { 
  User, Shield, Trophy, Users, Save, LogOut, 
  LayoutGrid, CheckCircle, Lock, Plus, Trash2, Key,
  Briefcase, Star, Medal, Crown, Zap, Loader2, AlertCircle, 
  BarChart3
} from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(null);

  const isAdmin = user?.role === 'admin';

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30">
      
      {/* --- TOAST NOTIFICATION (Slide In/Out) --- */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 border ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-[#0f172a] border-emerald-500/50 text-emerald-400'}`}>
          {toast.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-30 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <LayoutGrid size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Settings</h1>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Control Panel</p>
                </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-sm font-bold active:scale-95">
                <LogOut size={16} /> Sign Out
            </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        
        {/* TABS */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-slate-800 pb-1">
            <TabButton active={activeTab} name="profile" label="Profile" icon={<User size={18}/>} setTab={setActiveTab} />
            <TabButton 
                active={activeTab} 
                name="achievements" 
                label={isAdmin ? "Sales Arena" : "My Achievements"} 
                icon={isAdmin ? <Trophy size={18}/> : <Medal size={18}/>} 
                setTab={setActiveTab} 
            />
            <TabButton active={activeTab} name="security" label="Security" icon={<Shield size={18}/>} setTab={setActiveTab} />
            {isAdmin && <TabButton active={activeTab} name="team" label="Team" icon={<Users size={18}/>} setTab={setActiveTab} />}
        </div>

        {/* CONTENT AREA (With Key-Based Animation) */}
        {/* 🔑 key={activeTab} ensures animation replays on tab switch */}
        <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            {activeTab === 'profile' && <ProfileSettings user={user} showToast={showToast} />}
            
            {activeTab === 'achievements' && (
                isAdmin ? <AdminVisualLeaderboard /> : <GamificationSettings user={user} />
            )}

            {activeTab === 'security' && <SecuritySettings showToast={showToast} />}
            {activeTab === 'team' && isAdmin && <TeamSettings showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}

// ================= 1. ADMIN LEADERBOARD (Animated Podium) =================
function AdminVisualLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [stats, setStats] = useState({ totalDeals: 0, topPerformer: "-" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const usersRes = await api.get("/auth/users");
                const leadsRes = await api.get("/leads");
                
                const allUsers = usersRes.data.filter(u => u.role !== 'admin');
                const allLeads = leadsRes.data;

                const rankedUsers = allUsers.map(user => {
                    const userId = user._id || user.id;
                    const wins = allLeads.filter(l => {
                        const leadAgentId = l.assignedTo?._id || l.assignedTo?.id;
                        return leadAgentId === userId && l.status === 'Closed';
                    }).length;
                    const xp = wins * 100;
                    return { ...user, wins, xp };
                });

                const sorted = rankedUsers.sort((a, b) => b.wins - a.wins);
                
                setLeaderboard(sorted);
                setStats({
                    totalDeals: allLeads.filter(l => l.status === 'Closed').length,
                    topPerformer: sorted.length > 0 ? sorted[0].name : "No Data"
                });
            } catch (error) { console.error(error); } 
            finally { setLoading(false); }
        };
        fetchLeaderboard();
    }, []);

    if(loading) return <div className="p-20 text-center text-slate-500 flex flex-col items-center animate-pulse"><Loader2 className="animate-spin mb-4" size={32}/> Calculating Ranks...</div>;

    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    return (
        <div className="space-y-8">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={<Briefcase size={24}/>} label="Total Deals Closed" value={stats.totalDeals} color="emerald" delay="0"/>
                <StatCard icon={<Crown size={24}/>} label="Top Performer" value={stats.topPerformer} color="yellow" delay="100"/>
                <StatCard icon={<Users size={24}/>} label="Active Agents" value={leaderboard.length} color="blue" delay="200"/>
            </div>

            {/* 🏆 THE PODIUM (Animated Entry) */}
            {leaderboard.length > 0 ? (
                <div className="relative pt-10 pb-4">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                    
                    <div className="flex flex-wrap justify-center items-end gap-4 md:gap-8">
                        {/* RANK 2 */}
                        {top3[1] && <PodiumUser user={top3[1]} rank={2} delay="200" />}
                        {/* RANK 1 */}
                        {top3[0] && <PodiumUser user={top3[0]} rank={1} delay="0" />}
                        {/* RANK 3 */}
                        {top3[2] && <PodiumUser user={top3[2]} rank={3} delay="400" />}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 text-slate-500">No data to display podium.</div>
            )}

            {/* Remaining List */}
            {rest.length > 0 && (
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-500">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Runner Ups</h3>
                    <div className="space-y-2">
                        {rest.map((agent, index) => (
                            <div key={agent._id} className="flex items-center justify-between p-3 rounded-xl bg-[#020617] border border-slate-800/50 hover:border-slate-700 hover:bg-slate-900 transition-all group">
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-500 font-bold text-sm w-6">#{index + 4}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-white border border-slate-700 group-hover:border-indigo-500 transition-colors">
                                            {agent.name.charAt(0)}
                                        </div>
                                        <span className="text-slate-200 font-medium">{agent.name}</span>
                                    </div>
                                </div>
                                <span className="font-mono text-white text-sm font-bold bg-slate-800 px-2 py-1 rounded">{agent.wins} Wins</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ================= 2. USER GAMIFICATION (Animated Bars) =================
function GamificationSettings({ user }) {
    const [stats, setStats] = useState({ won: 0, level: 1, xp: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculateLevel = async () => {
            const userId = user?._id || user?.id;
            if (!userId) return;

            try {
                const res = await api.get("/leads");
                const myWonDeals = res.data.filter(l => {
                    const leadAgentId = l.assignedTo?._id || l.assignedTo?.id;
                    return leadAgentId === userId && l.status === 'Closed';
                }).length;

                const xp = myWonDeals * 100;
                const level = Math.floor(xp / 300) + 1;
                setStats({ won: myWonDeals, xp, level });
            } catch (error) { console.error(error); } 
            finally { setLoading(false); }
        };
        if (user) calculateLevel();
    }, [user]);

    if (loading) return <div className="p-10 text-center text-slate-500"><Loader2 className="animate-spin mx-auto mb-2"/> Loading Stats...</div>;

    const nextLevelXp = stats.level * 300;
    const progress = (stats.xp % 300) / 300 * 100;

    return (
        <div className="space-y-8">
            {/* Level Card */}
            <div className="bg-gradient-to-r from-indigo-900 to-[#0f172a] border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden shadow-2xl group hover:shadow-indigo-500/10 transition-all duration-500">
                <div className="absolute top-0 right-0 p-20 bg-indigo-500/20 blur-[100px] rounded-full"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl shadow-lg border-4 border-[#0f172a] animate-in zoom-in duration-500">🏆</div>
                    <div className="flex-1 w-full text-center md:text-left">
                        <h2 className="text-2xl font-bold text-white mb-1">Level {stats.level} Sales Master</h2>
                        <p className="text-indigo-200 text-sm mb-4">You have earned <span className="text-white font-bold">{stats.xp} XP</span> from {stats.won} closed deals.</p>
                        
                        {/* Smooth Progress Bar */}
                        <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                            <div 
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 ease-out" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        
                        <div className="flex justify-between text-[10px] font-bold uppercase text-indigo-300 mt-2">
                            <span>Current Rank</span><span>{stats.xp} / {nextLevelXp} XP to Level {stats.level + 1}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Badges Grid */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Medal size={20} className="text-yellow-400"/> Earned Badges</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <BadgeCard title="First Blood" desc="Close 1st deal" icon={<Zap size={24}/>} unlocked={stats.won >= 1} color="text-blue-400" delay="0"/>
                    <BadgeCard title="Closer" desc="Close 5 deals" icon={<Briefcase size={24}/>} unlocked={stats.won >= 5} color="text-purple-400" delay="100"/>
                    <BadgeCard title="Expert" desc="Close 10 deals" icon={<Star size={24}/>} unlocked={stats.won >= 10} color="text-emerald-400" delay="200"/>
                    <BadgeCard title="Legend" desc="Close 25 deals" icon={<Crown size={24}/>} unlocked={stats.won >= 25} color="text-yellow-400" delay="300"/>
                </div>
            </div>
        </div>
    );
}

// ================= 3. PROFILE SETTINGS =================
function ProfileSettings({ user, showToast }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: user?.name || "", email: user?.email || "" });

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/auth/updatedetails', formData);
            showToast("Profile updated successfully!");
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) { showToast("Update failed", "error"); } 
        finally { setLoading(false); }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 text-center shadow-xl hover:border-indigo-500/30 transition-all duration-300">
                    <div className="w-24 h-24 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-white mb-4 border-2 border-slate-700 shadow-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-bold text-white">{user?.name}</h3>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase border border-indigo-500/20 mt-2 inline-block">
                        {user?.role}
                    </span>
                </div>
            </div>
            <div className="md:col-span-2 bg-[#0f172a] border border-white/5 rounded-2xl p-8 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><User size={20} className="text-indigo-400"/> Personal Details</h2>
                <form onSubmit={handleSave} className="space-y-5">
                    <InputGroup label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <InputGroup label="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <div className="pt-4 flex justify-end"><SaveButton loading={loading} /></div>
                </form>
            </div>
        </div>
    );
}

function SecuritySettings({ showToast }) {
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirm) return showToast("New passwords do not match", "error");
        setLoading(true);
        try {
            await api.put('/auth/updatepassword', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
            showToast("Password updated!");
            setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
        } catch (error) { showToast("Incorrect current password", "error"); } 
        finally { setLoading(false); }
    };

    return (
        <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8 shadow-xl max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Lock size={20} className="text-indigo-400"/> Change Password</h2>
            <form onSubmit={handleUpdate} className="space-y-6">
                <InputGroup label="Current Password" type="password" value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="New Password" type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
                    <InputGroup label="Confirm New" type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                </div>
                <div className="pt-4 flex justify-start"><SaveButton label="Update Password" loading={loading} /></div>
            </form>
        </div>
    );
}

// ================= 4. TEAM SETTINGS =================
function TeamSettings({ showToast }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "user" });

    const fetchUsers = async () => {
        try { const res = await api.get("/auth/users"); setUsers(res.data); } catch (error) {}
    };
    useEffect(() => { fetchUsers(); }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/auth/register", newUser);
            showToast("User added!");
            setNewUser({ name: "", email: "", password: "", role: "user" });
            fetchUsers();
        } catch (error) { showToast("Failed to add", "error"); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Remove user?")) return;
        try { await api.delete(`/auth/users/${id}`); setUsers(users.filter(u => u._id !== id)); showToast("User removed"); } 
        catch (error) { showToast("Failed", "error"); }
    };

    return (
        <div className="space-y-8">
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Plus size={20} className="text-indigo-400"/> Invite Member</h2>
                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <InputGroup label="Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                    <InputGroup label="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                    <InputGroup label="Password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95">
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <><Plus size={18}/> Add User</>}
                    </button>
                </form>
            </div>
            
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-8 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Users size={20} className="text-indigo-400"/> Team Directory</h2>
                <div className="space-y-3">
                    {users.map((u, i) => (
                        <div key={u._id} className="flex items-center justify-between p-4 bg-[#020617]/50 border border-slate-800 rounded-xl hover:border-slate-600 transition-all hover:-translate-y-1 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">{u.name.charAt(0).toUpperCase()}</div>
                                <div><p className="font-bold text-white text-sm">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{u.role}</span>
                                {u.role !== 'admin' && <button onClick={() => handleDelete(u._id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 size={18}/></button>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS (With Micro-Interactions) ---

const PodiumUser = ({ user, rank, delay }) => {
    const colors = {
        1: { border: "border-yellow-400", badge: "bg-yellow-400 text-black", glow: "border-yellow-500/30", text: "text-yellow-400" },
        2: { border: "border-slate-400", badge: "bg-slate-400 text-black", glow: "border-slate-500/30", text: "text-slate-400" },
        3: { border: "border-amber-600", badge: "bg-amber-600 text-black", glow: "border-amber-700/30", text: "text-amber-600" }
    };
    
    return (
        <div className={`flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in duration-700 ${rank === 1 ? 'z-10' : ''}`} style={{ animationDelay: `${delay}ms` }}>
            {rank === 1 && <Crown size={32} className="text-yellow-400 mb-2 fill-yellow-400 drop-shadow-lg animate-bounce" />}
            <div className={`w-${rank === 1 ? '28' : '20'} h-${rank === 1 ? '28' : '20'} rounded-full border-4 ${colors[rank].border} bg-slate-800 flex items-center justify-center text-${rank === 1 ? '3xl' : 'xl'} font-bold text-white mb-3 relative shadow-2xl group transition-transform hover:scale-105`}>
                {user.name.charAt(0)}
                <div className={`absolute -bottom-3 ${colors[rank].badge} text-xs font-bold px-3 py-0.5 rounded-full border-2 border-[#020617] shadow-lg`}>
                    #{rank}
                </div>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{user.name}</h3>
            <p className={`text-sm ${colors[rank].text} font-bold font-mono`}>{user.wins} Wins</p>
            <div className={`w-${rank === 1 ? '32' : '24'} h-${rank === 1 ? '32' : '24'} bg-gradient-to-t from-slate-800/20 to-transparent mt-2 rounded-t-xl border-t ${colors[rank].glow}`}></div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color, delay }) => {
    const bgColors = {
        emerald: "bg-emerald-500/10 text-emerald-400",
        yellow: "bg-yellow-500/10 text-yellow-400",
        blue: "bg-blue-500/10 text-blue-400"
    };
    return (
        <div 
            className="bg-[#0f172a] border border-white/5 p-6 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 hover:border-white/20 transition-all hover:-translate-y-1"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={`p-3 rounded-xl ${bgColors[color]}`}>{icon}</div>
            <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">{label}</p>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
            </div>
        </div>
    );
};

const BadgeCard = ({ title, desc, icon, unlocked, color, delay }) => (
    <div 
        className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-300 hover:scale-105 ${unlocked ? `bg-[#020617] border-white/10 ${color} shadow-lg` : 'bg-[#020617]/50 border-white/5 text-slate-600 grayscale opacity-60'}`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`p-3 rounded-full bg-slate-800/50 mb-3 ${unlocked ? 'shadow-[0_0_15px_rgba(255,255,255,0.1)]' : ''}`}>{icon}</div>
        <h4 className="font-bold text-sm mb-1">{title}</h4>
        <p className="text-[10px] text-slate-500">{desc}</p>
        {unlocked && <span className="mt-2 text-[9px] font-bold bg-white/10 px-2 py-0.5 rounded text-white animate-pulse">UNLOCKED</span>}
    </div>
);

const TabButton = ({ active, name, label, icon, setTab }) => (
    <button onClick={() => setTab(name)} className={`flex items-center gap-2 px-6 py-3 rounded-t-lg text-sm font-bold border-b-2 transition-all duration-300 ${active === name ? "border-indigo-500 text-white bg-[#0f172a]" : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}>
        {icon} {label}
    </button>
);

const InputGroup = ({ label, value, onChange, type="text", placeholder }) => (
    <div className="w-full group">
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 group-focus-within:text-indigo-400 transition-colors">{label}</label>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all focus:shadow-[0_0_10px_rgba(99,102,241,0.2)]" />
    </div>
);

const SaveButton = ({ label = "Save Changes", loading }) => (
    <button disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50">
        {loading ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18} /> {label}</>}
    </button>
);