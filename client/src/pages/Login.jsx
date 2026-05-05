import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Mail, Lock, ArrowRight, LayoutDashboard, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a14] px-4">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-[420px] bg-[#13132b]/90 backdrop-blur-xl rounded-[28px] border border-[#2d2d5e]/60 shadow-[0_30px_80px_rgba(0,0,0,0.6)] p-8 pt-10">
        
        {/* Logo Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-[68px] h-[68px] bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-[18px] flex items-center justify-center shadow-[0_8px_30px_rgba(124,58,237,0.5)]">
            <LayoutDashboard className="text-white" size={32} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-center text-[2rem] font-black text-white tracking-tight mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-[#9ca3af] text-[15px] mb-8">
          Log in to manage your tasks effectively.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.2em]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-11 pr-4 py-3.5 bg-[#1c1c38] border border-[#2d2d5e] rounded-xl text-white placeholder-[#4b5563] text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.2em]">
                Password
              </label>
              <Link to="/forgot-password" className="text-[13px] text-[#7c3aed] hover:text-[#a78bfa] font-semibold transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3.5 bg-[#1c1c38] border border-[#2d2d5e] rounded-xl text-white placeholder-[#4b5563] text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#9ca3af] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 rounded-xl font-black text-white text-[15px] tracking-wide
              bg-gradient-to-r from-[#7c3aed] to-[#6366f1]
              hover:from-[#6d28d9] hover:to-[#4f46e5]
              shadow-[0_8px_30px_rgba(124,58,237,0.35)]
              hover:shadow-[0_8px_40px_rgba(124,58,237,0.5)]
              transition-all duration-200
              flex items-center justify-center gap-2
              active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In Now <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-[#6b7280] text-sm mt-7">
          New here?{' '}
          <Link to="/signup" className="text-[#7c3aed] hover:text-[#a78bfa] font-bold transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
