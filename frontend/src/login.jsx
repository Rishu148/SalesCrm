import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "../src/context/AuthContext"; // Assuming this exists
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  BarChart3,
  ShieldCheck,
  Loader2,
  AlertCircle
} from "lucide-react";


// Use environment variable for API URL (Best Practice)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function Login() {
  const navigate = useNavigate();

  const { loginAction } = useAuth();
  const { setUser } = useAuth(); 

  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError("");
  };

  const handleLoginSuccess = (role) => {
    // Navigate based on role immediately after success
    if (role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/home");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
        setError("Please fill in all fields.");
        return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_URL}/auth/login`,
        formData,
        { withCredentials: true }
      );


      if (res.data.user) {
         loginAction(res.data.user); 
      }
      // Optional: Update global auth context here if needed
      // setUser(res.data.user);

      handleLoginSuccess(res.data.user.role);

    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError("");
    try {
        // Send the Google JWT to your backend to verify and create session
        const res = await axios.post(
            `${API_URL}/auth/google`,
            { token: credentialResponse.credential },
            { withCredentials: true }
        );
        handleLoginSuccess(res.data.user.role);
    } catch (err) {
        setError("Google authentication failed. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#0B1220] text-white font-sans">
      
      {/* LEFT – LOGIN FORM */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BarChart3 size={22} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">SalesForce One</h1>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-400">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400 transition-colors group-focus-within:text-blue-500" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full pl-10 py-3 rounded-lg bg-[#111827] border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#111827] border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-[#111827] text-blue-600 focus:ring-blue-500 focus:ring-offset-[#0B1220]" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg font-semibold text-white transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                    <Loader2 size={20} className="animate-spin" />
                    Signing in...
                </>
              ) : "Sign in"}
            </button>
          </form>

          {/* Social Auth */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0B1220] px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleLogin
                theme="filled_blue"
                size="large"
                width="100%"
                shape="rectangular"
                text="signin_with"
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
            />
          </div>

          {/* Footer */}
          <div className="text-center space-y-4">
            <p className="text-gray-400 text-sm">
                Don’t have an account?{" "}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign up for a trial
                </Link>
            </p>
            <p className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <ShieldCheck size={14} /> 256-bit Secure SSL Connection
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT – TESTIMONIAL / HERO IMAGE */}
      <div className="hidden md:block relative bg-gray-900">
        {/* Background Image */}
        <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')"
            }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/80 to-blue-900/20" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-12 lg:p-16">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center mb-8">
                <span className="text-blue-400 text-2xl font-bold">"</span>
            </div>

            <blockquote className="text-2xl font-medium leading-relaxed text-gray-100 mb-8 max-w-lg">
                SalesForce One transformed how our team tracks revenue.
                The interface is simply the fastest on the market.
            </blockquote>

            <div className="flex items-center gap-4">
                <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100"
                    alt="Alex Morgan"
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/50"
                />
                <div>
                    <p className="font-semibold text-white">Alex Morgan</p>
                    <p className="text-sm text-gray-400">VP of Sales, TechCorp</p>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
}

export default Login;