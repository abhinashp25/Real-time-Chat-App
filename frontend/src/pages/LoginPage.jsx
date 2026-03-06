import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MailIcon, LockIcon, LoaderIcon, MessageCircleIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn }  = useAuthStore();
  const handleSubmit = (e) => { e.preventDefault(); login(formData); };
  const set = (k) => (e) => setFormData((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-[#0f1621]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-cyan-500/30">
            <MessageCircleIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-[22px] font-semibold text-slate-100">Welcome to Chatify</h1>
          <p className="text-slate-500 text-[13px] mt-1">Sign in to continue</p>
        </div>

        {/* Card */}
        <div className="bg-[#1f2c34] rounded-2xl p-6 shadow-2xl border border-white/8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="auth-input-label">Email</label>
              <div className="relative">
                <MailIcon className="auth-input-icon" />
                <input type="email" value={formData.email} onChange={set("email")}
                  className="input" placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label className="auth-input-label">Password</label>
              <div className="relative">
                <LockIcon className="auth-input-icon" />
                <input type="password" value={formData.password} onChange={set("password")}
                  className="input" placeholder="Enter your password" required />
              </div>
            </div>
            <button className="auth-btn mt-1" type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? <LoaderIcon className="w-4 h-4 animate-spin mx-auto" /> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-slate-500 text-[13px] mt-5">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="auth-link">Create one</Link>
          </p>
        </div>

        <p className="text-center text-slate-700 text-[11px] mt-6">
          🔒 End-to-end encrypted
        </p>
      </div>
    </div>
  );
}
