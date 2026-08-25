import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Eye, EyeOff, ArrowRight, Shield, Key, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { api } from '../../services/api';
import Logo from '../../assets/Logo.png';

function validatePassword(p) {
  if (!p || p.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(p)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(p)) return 'Password must contain at least one lowercase letter';
  if (!/\d/.test(p)) return 'Password must contain at least one number';
  return null;
}

export default function LoginPage() {
  const { login } = useAuth();
  const { refreshProfile } = useProfile();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'forgot'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setTimeout(() => setOtpCooldown(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCooldown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError('');
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true);
    try {
      const res = await api.sendOtp('forgot_password', email);
      setOtpSent(true);
      setOtpCooldown(60);
      toast.success(res.message || res.Message || 'OTP sent to your email!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) { setError('Please enter OTP'); return; }
    const pwErr = validatePassword(newPassword);
    if (pwErr) { setError(pwErr); return; }
    if (newPassword !== confirmNewPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await api.forgotPassword(email, otp, newPassword);
      toast.success(res.message || res.Message || 'Password reset successfully!');
      setMode('login');
      setOtp(''); setNewPassword(''); setConfirmNewPassword(''); setOtpSent(false);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setPassword(''); setOtp(''); setNewPassword(''); setConfirmNewPassword('');
    setOtpSent(false); setShowPassword(false); setShowNewPassword(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex">
      {/* Left Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 dark:bg-white/[0.02] relative overflow-hidden items-center justify-center border-r border-slate-200 dark:border-white/[0.06]">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[400px] h-[400px] bg-secondary-500/8 rounded-full blur-[80px]" />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary-500/25">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Welcome to NexoraMind Tech</h2>
          <p className="text-slate-500 dark:text-white/40 leading-relaxed max-w-sm mx-auto font-normal">Access verified certifications and internship opportunities to advance your tech career.</p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6"><img src={Logo} alt="NexoraMind Tech" className="h-9 w-auto" /></Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Reset Password'}
            </h1>
            <p className="text-slate-500 dark:text-white/40 mt-1 font-normal">
              {mode === 'login' ? 'Sign in to your account' : 'Enter OTP to set a new password'}
            </p>
          </div>

          {/* Mode Tabs */}
          

          <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-8">

            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/60 mb-1.5">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/25 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/60 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="button" onClick={() => switchMode('forgot')} className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                </button>

                <div className="pt-5 border-t border-slate-200 dark:border-white/[0.06] text-center">
                  <p className="text-sm text-slate-500 dark:text-white/40">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign up</Link>
                  </p>
                </div>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <button type="button" onClick={() => switchMode('login')} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 transition-colors -mt-2">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/60 mb-1.5">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setOtpSent(false); }}
                      required
                      disabled={otpSent}
                      className="w-full pl-4 pr-32 py-2.5 rounded-xl bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || otpCooldown > 0}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[11px] font-bold border border-primary-500/20 hover:bg-primary-500/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> :
                       otpCooldown > 0 ? `${otpCooldown}s` :
                       otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>
                  {otpSent && (
                    <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> OTP sent to {email}. Check your inbox.
                    </p>
                  )}
                </div>

                {/* OTP */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/60 mb-1.5 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> OTP Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    disabled={!otpSent}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm tracking-[0.3em] placeholder:tracking-normal placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all text-center font-mono font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/60 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="At least 8 chars, 1 upper, 1 lower, 1 number"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={!otpSent}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 transition-colors">
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/60 mb-1.5">Confirm New Password</label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    disabled={!otpSent}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !otpSent}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
