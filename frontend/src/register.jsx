import { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  BarChart3,
  ChartNoAxesCombined,
} from "lucide-react";

function Register() {
  const [showPass, setShowPass] = useState(false);
  const [showCpass, setShowCpass] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name || !formData.email || !formData.password) {
    alert("All fields are required");
    return;
  }

  if (formData.password.length < 8) {
    alert("Password must be at least 8 characters");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    await axios.post(
      "http://localhost:8080/api/auth/register",
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      },
      { withCredentials: true }
    );

    navigate("/login");

  } catch (error) {
    alert(error.response?.data?.message || "Register failed");
  }
};



  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#0B1220] text-white">

      {/* LEFT – REGISTER FORM */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-blue-500" />
            <h1 className="text-xl font-semibold">SalesPro CRM</h1>
          </div>

          <h2 className="text-3xl font-bold mb-1">Create your account</h2>
          <p className="text-gray-400 mb-6">
            Start your 14-day free trial. No credit card required.
          </p>

          {/* Google Signup */}

          <GoogleLogin
            theme="filled_blue"
            size="large"
            shape="rectangular"
            text="signup_with"
            onSuccess={(res) => {
              console.log("Google Signup Success:", res);
              alert("Google Signup Success");
            }}
            onError={() => {
              alert("Google Signup Failed");
            }}
          />


 
          <div className="text-center text-gray-500 my-4">
            Or sign up with email
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                name="name"
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full pl-10 py-3 rounded bg-[#111827] border border-gray-700 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                onChange={handleChange}
                placeholder="Work Email"
                className="w-full pl-10 py-3 rounded bg-[#111827] border border-gray-700 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                onChange={handleChange}
                placeholder="Password (min 8 characters)"
                className="w-full pl-10 pr-10 py-3 rounded bg-[#111827] border border-gray-700 focus:border-blue-500 outline-none"
              />
              {showPass ? (
                <EyeOff
                  className="absolute right-3 top-3.5 cursor-pointer text-gray-400"
                  size={18}
                  onClick={() => setShowPass(false)}
                />
              ) : (
                <Eye
                  className="absolute right-3 top-3.5 cursor-pointer text-gray-400"
                  size={18}
                  onClick={() => setShowPass(true)}
                />
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type={showCpass ? "text" : "password"}
                name="confirmPassword"
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full pl-10 pr-10 py-3 rounded bg-[#111827] border border-gray-700 focus:border-blue-500 outline-none"
              />
              {showCpass ? (
                <EyeOff
                  className="absolute right-3 top-3.5 cursor-pointer text-gray-400"
                  size={18}
                  onClick={() => setShowCpass(false)}
                />
              ) : (
                <Eye
                  className="absolute right-3 top-3.5 cursor-pointer text-gray-400"
                  size={18}
                  onClick={() => setShowCpass(true)}
                />
              )}
            </div>

            {/* Terms */}
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input type="checkbox" className="accent-blue-500" required />
              I agree to Terms & Privacy Policy
            </label>

            {/* Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 rounded font-semibold hover:bg-blue-700 transition"
            >
              Create Account →
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400">
              Log in
            </Link>
          </p>

          <p className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
            <ShieldCheck size={14} /> Secure & Encrypted
          </p>
        </div>
      </div>

      {/* RIGHT – CONTENT */}
      <div
        className="hidden md:flex items-center justify-center relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDgRve9-cgeqprcs2j3SMqrIpcMcfPVRYjHEquB_eL8z1FscPiT_fzDDw2JywlYRXs1avVe-e7hsmmH6feQUGCZP57NKtkOEgSN9JT3P75Nwhqm-EkdFSfNrhbb1gn9V7SMs7uZFKJ2Mp9LCseV39gfhaDPc8wyHuxg7_NtVTr67Z7iRqICh_B0Kni3ruanDfMtUotkx2ZT1rBTcLlTKFfuAbm8lxN6Am5IH-P3bBKeYa19dCq0kiCFgIjNcjuV2moHH8407q6sh62T')",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Content */}
        <div className="relative max-w-md text-center px-6">


       <div className="flex items-center justify-center">
       <ChartNoAxesCombined  size={60} className="text-blue-500"/>
       </div>   


          <h2 className="text-3xl font-bold mb-4">
            Track revenue. <br /> Close more deals.
          </h2>

          <p className="text-gray-300 mb-10">
          Join over 10,000 sales professionals who use SalesPro to organize leads, track pipelines, and crush their quotas.
          </p>

          <div className=" backdrop-blur-lg bg-white/10 p-6 rounded-xl text-left">
            <div className="text-yellow-400 mb-2">★★★★★</div>
            <p className="text-sm text-gray-200 mb-4">
                “SalesPro completely transformed our sales workflow.
              Simple, fast, and powerful.”
            </p>
            <div className="flex items-center gap-4">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAv8Wdc5uc0A6gBoPKjltgjPUKvzIZaSTQ4daPYZps7-AYD6JZ7y2-lSIhiL_EFZyO1DBk9oLrwQSJA--vEtrBWUFsdz_hbkxQduMo4DhzBGZYwwnhCNA_2T-aHW1SJ7gwxTVyvIiD8nnEPEXYlzWML6sQkOPxdStJ_UmFZILOiYt7PQES2Ey5_cCB6S0d0XD1j1KOgPLM2OqUmrhnH6TiMSpyG8xMYxmZr2oG-kAAojFur-PqSRVPuWep2rgOJtXVIYY058C7LQdTq"
              alt="Marcus Chen"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">Marcus Chen</p>
              <p className="text-sm text-gray-400">
                VP of Sales, TechCorp
              </p>
            </div>
          </div>
           
          </div>
        </div>
      </div>

    </div>
  );
}   

export default Register;
