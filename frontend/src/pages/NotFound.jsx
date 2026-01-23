import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { ArrowLeft, Home, LogIn, LayoutDashboard, FileQuestion, AlertTriangle, LogOut } from "lucide-react";

function NotFound() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Logout function bhi nikalo

  // ✅ SAFER CHECK: Sirf 'user' nahi, 'user.email' bhi check karo
  const isLoggedIn = user && user.email;

  const handleRedirect = () => {
    if (isLoggedIn) {
      // Agar sach mein login hai
      navigate(user.role === "admin" ? "/dashboard" : "/home");
    } else {
      // Agar login nahi hai
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1220] text-white relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* Background (Same as before) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        
        {/* Icon */}
        <div className="relative mx-auto mb-8 animate-bounce-slow">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
           <div className="relative w-32 h-32 mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/10 ring-1 ring-white/5">
              <FileQuestion size={64} className="text-blue-400 drop-shadow-lg" strokeWidth={1.5} />
              <div className="absolute top-3 right-3 w-8 h-8 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center animate-spin-slow">
                  <AlertTriangle size={14} className="text-red-400" />
              </div>
           </div>
        </div>

        {/* Text */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-8xl md:text-[10rem] font-extrabold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-600">
                404
            </h1>
            <h2 className="text-3xl font-bold text-white">Page Not Found</h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
                The page you are looking for doesn't exist or an other error occurred.
            </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold transition-all active:scale-95"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <button
            onClick={handleRedirect}
            className="relative group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white overflow-hidden transition-all active:scale-95 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:scale-105 transition-transform duration-500"></div>
            
            <span className="relative z-10 flex items-center gap-2">
                {!isLoggedIn ? (
                    <>
                        <LogIn size={20} />
                        <span>Sign In</span>
                    </>
                ) : user.role === "admin" ? (
                    <>
                        <LayoutDashboard size={20} />
                        <span>Back to Dashboard</span>
                    </>
                ) : (
                    <>
                        <Home size={20} />
                        <span>Back to Home</span>
                    </>
                )}
            </span>
          </button>
        </div>

        {/* 👇 DEBUGGING HELPER: Agar app confuse hai to ye button dikhega */}
        {isLoggedIn && (
            <div className="mt-8">
                <p className="text-xs text-slate-500 mb-2">Logged in as: {user.email}</p>
                <button 
                    onClick={() => { logout(); navigate("/login"); }}
                    className="text-xs flex items-center gap-1 mx-auto text-red-400 hover:text-red-300 border-b border-red-400/30 pb-0.5"
                >
                    <LogOut size={10} />
                    Not you? Force Logout
                </button>
            </div>
        )}

      </div>
    </div>
  );
}

export default NotFound;