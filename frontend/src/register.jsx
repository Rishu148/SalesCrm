import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BarChart3,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Rocket
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function Register() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showCpass, setShowCpass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return setError("All fields are required");
    if (formData.password.length < 8) return setError("Password must be at least 8 characters");
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match");

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, { name: formData.name, email: formData.email, password: formData.password }, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-emerald-500/30 flex w-full relative overflow-hidden">
      
      {/* CSS HACK FOR AUTOFILL */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #0A0A0C inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      {/* RIGHT SIDE - VISUAL (Order Last on Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-[#050505] relative items-center justify-center overflow-hidden border-r border-white/5 order-last">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-lg">
            <div className="mb-10">
                <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                    Start your 14-day <br/>
                    <span className="text-emerald-500">Free Trial.</span>
                </h2>
                <p className="text-lg text-slate-400">Join 10,000+ sales teams. No credit card required.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-[#0A0A0C] border border-white/5">
                    <Rocket size={32} className="text-emerald-500 mb-4"/>
                    <h4 className="font-bold text-white text-lg">Instant Setup</h4>
                    <p className="text-sm text-slate-500 mt-2">Get started in less than 2 minutes.</p>
                </div>
                <div className="p-6 rounded-3xl bg-[#0A0A0C] border border-white/5">
                    <ShieldCheck size={32} className="text-blue-500 mb-4"/>
                    <h4 className="font-bold text-white text-lg">Secure Data</h4>
                    <p className="text-sm text-slate-500 mt-2">Enterprise-grade encryption included.</p>
                </div>
            </div>
        </div>
      </div>

      {/* LEFT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10 bg-[#030303]">
        
        {/* Brand */}
        <div className="absolute top-10 left-8 sm:left-16 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <BarChart3 size={20} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Sales<span className="text-emerald-500">CRM</span></span>
        </div>

        <div className="w-full max-w-sm mx-auto mt-16">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-white mb-3">Create Account</h1>
                <p className="text-slate-400">Join us and scale your sales pipeline.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-in fade-in">
                    <AlertCircle size={18} className="shrink-0"/> 
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <div className="w-full grayscale hover:grayscale-0 transition-all duration-300 opacity-80 hover:opacity-100 mb-8">
                <GoogleLogin theme="filled_black" size="large" width="100%" shape="pill" text="signup_with" onSuccess={() => alert("Google Logic")} onError={() => setError("Google failed")} />
            </div>

            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider"><span className="bg-[#030303] px-3 text-slate-500">Or register via email</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                        <input type="text" name="name" onChange={handleChange} required placeholder="John Doe"
                            className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl h-12 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"/>
                        <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20}/>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
                    <div className="relative group">
                        <input type="email" name="email" onChange={handleChange} required placeholder="name@company.com"
                            className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl h-12 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"/>
                        <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20}/>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <input type={showPass ? "text" : "password"} name="password" onChange={handleChange} required placeholder="8+ chars"
                                className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl h-12 pl-10 pr-8 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"/>
                            <Lock className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18}/>
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 top-3.5 text-slate-500 hover:text-white transition-colors">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm</label>
                        <div className="relative group">
                            <input type={showCpass ? "text" : "password"} name="confirmPassword" onChange={handleChange} required placeholder="Retype"
                                className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl h-12 pl-10 pr-8 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"/>
                            <Lock className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18}/>
                            <button type="button" onClick={() => setShowCpass(!showCpass)} className="absolute right-2 top-3.5 text-slate-500 hover:text-white transition-colors">{showCpass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                        </div>
                    </div>
                </div>

                <label className="flex items-center gap-3 text-xs text-slate-400 cursor-pointer pt-2">
                    <input type="checkbox" required className="w-4 h-4 rounded border-slate-700 bg-[#0A0A0C] text-emerald-500 focus:ring-emerald-500" />
                    <span>I agree to <span className="text-white hover:underline">Terms</span> & <span className="text-white hover:underline">Privacy Policy</span></span>
                </label>

                <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                    {isLoading ? <Loader2 className="animate-spin" size={20}/> : <>Create Account <ArrowRight size={20}/></>}
                </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-8">
                Have an account? <Link to="/login" className="text-white hover:text-emerald-400 font-bold transition-colors border-b border-transparent hover:border-emerald-400">Log in</Link>
            </p>
        </div>
      </div>

    </div>
  );
}

export default Register;