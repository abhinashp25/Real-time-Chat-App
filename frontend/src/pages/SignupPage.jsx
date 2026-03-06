import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { UserIcon, MailIcon, LockIcon, LoaderIcon, MessageCircleIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function SignupPage() {
  const [formData, setFormData]  = useState({ fullName: "", email: "", password: "" });
  const { signup, isSigningUp }  = useAuthStore();
  const handleSubmit = (e) => { e.preventDefault(); signup(formData); };
  const set = (k) => (e) => setFormData((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 bg-[#0f1621]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-cyan-500/30">
            <MessageCircleIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-[22px] font-semibold text-slate-100">Create your account</h1>
          <p className="text-slate-500 text-[13px] mt-1">Join Chatify for free</p>
        </div>

        {/* Card */}
        <div className="bg-[#1f2c34] rounded-2xl p-6 shadow-2xl border border-white/8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="auth-input-label">Full Name</label>
              <div className="relative">
                <UserIcon className="auth-input-icon" />
                <input type="text" value={formData.fullName} onChange={set("fullName")}
                  className="input" placeholder="Your full name" required />
              </div>
            </div>
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
                  className="input" placeholder="At least 6 characters" required />
              </div>
            </div>
            <button className="auth-btn mt-1" type="submit" disabled={isSigningUp}>
              {isSigningUp ? <LoaderIcon className="w-4 h-4 animate-spin mx-auto" /> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-slate-500 text-[13px] mt-5">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-slate-700 text-[11px] mt-6">
          🔒 End-to-end encrypted
        </p>
      </div>
    </div>
  );
}
