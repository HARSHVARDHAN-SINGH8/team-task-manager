import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { LayoutDashboard, Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1=email, 2=new password, 3=success
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Check if email exists
      const res = await api.post('/auth/reset-password', { email, newPassword: 'CHECK_ONLY' });
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No account found with that email address.');
        setLoading(false);
        return;
      }
    }
    setStep(2);
    setLoading(false);
  };

  // Just advance to step 2 if email is provided
  const handleNext = (e) => {
    e.preventDefault();
    if (!email) return;
    setStep(2);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, newPassword });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a14] px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-[420px] bg-[#13132b]/90 backdrop-blur-xl rounded-[28px] border border-[#2d2d5e]/60 shadow-[0_30px_80px_rgba(0,0,0,0.6)] p-8 pt-10">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-[68px] h-[68px] bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] rounded-[18px] flex items-center justify-center shadow-[0_8px_30px_rgba(124,58,237,0.5)]">
            <LayoutDashboard className="text-white" size={32} />
          </div>
        </div>

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <>
            <h1 className="text-center text-[2rem] font-black text-white tracking-tight mb-2">Forgot Password?</h1>
            <p className="text-center text-[#9ca3af] text-[15px] mb-8">Enter your email to reset your password.</p>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">{error}</div>
            )}

            <form onSubmit={handleNext} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.2em]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#1c1c38] border border-[#2d2d5e] rounded-xl text-white placeholder-[#4b5563] text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl font-black text-white text-[15px] bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#6d28d9] hover:to-[#4f46e5] shadow-[0_8px_30px_rgba(124,58,237,0.35)] transition-all active:scale-[0.98]"
              >
                Continue →
              </button>
            </form>
          </>
        )}

        {/* Step 2: Set New Password */}
        {step === 2 && (
          <>
            <h1 className="text-center text-[2rem] font-black text-white tracking-tight mb-2">New Password</h1>
            <p className="text-center text-[#9ca3af] text-[15px] mb-8">Set a new password for <span className="text-purple-400 font-semibold">{email}</span></p>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">{error}</div>
            )}

            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.2em]">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-11 pr-12 py-3.5 bg-[#1c1c38] border border-[#2d2d5e] rounded-xl text-white placeholder-[#4b5563] text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[#9ca3af] uppercase tracking-[0.2em]">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" size={16} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#1c1c38] border border-[#2d2d5e] rounded-xl text-white placeholder-[#4b5563] text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full py-4 rounded-xl font-black text-white text-[15px] bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#6d28d9] hover:to-[#4f46e5] shadow-[0_8px_30px_rgba(124,58,237,0.35)] transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? 'Resetting...' : 'Reset Password →'}
              </button>
            </form>
          </>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-green-400" size={36} />
            </div>
            <h1 className="text-[2rem] font-black text-white">Password Reset!</h1>
            <p className="text-[#9ca3af]">Your password has been updated successfully.</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 mt-4 py-3.5 px-8 rounded-xl font-black text-white text-[15px] bg-gradient-to-r from-[#7c3aed] to-[#6366f1] shadow-[0_8px_30px_rgba(124,58,237,0.35)] hover:from-[#6d28d9] hover:to-[#4f46e5] transition-all"
            >
              Sign In Now →
            </Link>
          </div>
        )}

        {/* Back to login */}
        {step !== 3 && (
          <p className="text-center text-[#6b7280] text-sm mt-7">
            <Link to="/login" className="flex items-center justify-center gap-1 text-[#7c3aed] hover:text-[#a78bfa] font-bold transition-colors">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
