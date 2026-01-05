import { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

function Login() {
  const [showPass, setShowPass] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.email || !formData.password) {
    alert("All fields are required");
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:8080/api/auth/login",
      formData
    );

    // JWT token save
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // alert("Login Successful");
    // console.log(res.data);

 
    window.location.href = "/dashboard";

  } catch (error) {
    console.log({error})
    alert(error.response?.data?.message || "Login failed");
  }
};


  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#0B1220] text-white">

      {/* LEFT – LOGIN FORM */}
      <div className="flex items-center justify-center px-8">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold">SalesForce One</h1>
          </div>

          <h2 className="text-4xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-400 mb-8">
            Enter your credentials to access your dashboard.
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm mb-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full pl-10 py-3 rounded-md bg-[#111827] border border-gray-700 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-md bg-[#111827] border border-gray-700 focus:border-blue-500 outline-none"
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
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm text-gray-400">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-blue-500" />
                Remember me
              </label>
              <span className="text-blue-400 cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 text-center text-gray-500">
            Or continue with
          </div>

          {/* Google */}
          <GoogleLogin
            theme="filled_blue"
            size="large"
            shape="rectangular"
            text="signin_with"
            onSuccess={(res) => {
              console.log("Google Login Success:", res);
              alert("Google Login Success");
            }}
            onError={() => alert("Google Login Failed")}
          />

          {/* Register */}
          <p className="text-center text-gray-400 mt-6">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-400">
              Sign up for a trial
            </Link>
          </p>

          {/* Secure */}
          <p className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
            <ShieldCheck size={14} /> Secure & Encrypted
          </p>
        </div>
      </div>

      {/* RIGHT – TESTIMONIAL */}
      <div
        className="hidden md:flex relative items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA2uexZdKLSWdhwEGBZq5dFDzHXjlKhhV2alFkA9pbNuIS9CX-5ukHvXuJ88x6tP-_JgLRKy615kZ9Q-mjRjbtdCKczweZY1sFpR3Fkw6i0SXib9grGiGg_AmJPzXRC67ejZjpdUUWV2oYTXAmRtytr17NUCcaMMi6Pn_Toprt-9J7oTKxJJDRVaayxjxgVA97oyEb9B_ESibVfNeLlFJ9vgRAT005UBgZ7NZl0Y1qMWuw_9ombwzulQoBX1b29AUNVPkxCrq5UJtEE')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80"></div>

        <div className="relative max-w-xl text-white mt-90">
          <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-6">
            <span className="text-blue-400 text-2xl font-bold">99</span>
          </div>

          <p className="text-2xl leading-relaxed font-medium mb-8">
            “SalesForce One transformed how our team tracks revenue.
            The interface is simply the fastest on the market.”
          </p>

          <div className="flex items-center gap-4">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuYntB5jcUD6BCUNoCC71JojSeDMs08R9daLaw0BRye1CiqtB0mt1B9srtdc0R4xtUpm2NZpBrShDWLWcqnukV7I-OdyXQfBZOQ3Fvm8DQ-Rjys-6RHKge11Hf1Al3JknDFe_xlef2Hno8zJhRLnvnrzmuGYokCjdTo1O9cmV4wtJ5BKevVY6-ytzk17bl2MJzjvgqb_TtUPZjC0qvypsFKo_qIINiCL6ihMYDP5ADyqYlr0NDmnZlcw6chJCSm8gBl2ooCpYCQGBY"
              alt="Alex Morgan"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">Alex Morgan</p>
              <p className="text-sm text-gray-400">
                VP of Sales, TechCorp
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Login;
