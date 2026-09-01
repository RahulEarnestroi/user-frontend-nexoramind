import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Eye, EyeOff, ArrowRight, Key, Loader2, ArrowLeft, CheckCircle2, Award, FileText, Briefcase, Sparkles } from 'lucide-react';
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
      navigate('/internships');
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
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center border-r border-slate-200/70 dark:border-white/[0.06]"
           style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.10) 0%, rgba(255,255,255,0) 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0) 60%), #fafbfc' }}>
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-grid opacity-[0.35] dark:opacity-[0.08]" style={{ backgroundSize: '32px 32px' }} />

        {/* Floating gradient orbs */}
        <motion.div
          animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[12%] right-[10%] w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, rgba(139,92,246,0) 70%)', filter: 'blur(2px)' }}
        />
        <motion.div
          animate={{ y: [0, 16, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-[10%] left-[8%] w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.20) 0%, rgba(59,130,246,0) 70%)', filter: 'blur(2px)' }}
        />
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-[55%] left-[40%] w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, rgba(236,72,153,0) 70%)', filter: 'blur(2px)' }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-xl px-14 flex flex-col gap-10">
          {/* Logo + Brand */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary-500/30 to-secondary-500/30 blur-md" />
              <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-white/[0.06] border border-white shadow-lg shadow-primary-500/10 flex items-center justify-center">
                <img src={Logo} alt="NexoraMind" className="w-8 h-8 object-contain" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">NexoraMind</h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-primary-500/15 to-secondary-500/15 text-primary-700 dark:text-primary-300 border border-primary-500/20 uppercase tracking-widest">Tech</span>
              </div>
              <p className="mt-1 text-[11px] font-semibold text-slate-400 dark:text-white/30 tracking-wide uppercase">Internship · Certification · Careers</p>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500/30" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-white/60 tracking-wide">Your Career Journey Starts Here</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Build real projects.
              <br />
              Earn <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">verified</span> certificates.
            </h2>
            <p className="text-[14px] leading-relaxed text-slate-500 dark:text-white/40 font-medium max-w-md">
              Join structured internship programs with hands-on tasks, automated reviews, and verified credentials employers trust.
            </p>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
            className="space-y-3"
          >
            {[
              {
                icon: Briefcase,
                gradient: 'from-sky-500 to-blue-600',
                glow: 'shadow-sky-500/15',
                tag: 'Live Programs',
                title: 'Real Internship Roles',
                desc: 'Frontend · Backend · Data Science · Design',
              },
              {
                icon: Award,
                gradient: 'from-violet-500 to-purple-600',
                glow: 'shadow-violet-500/15',
                tag: 'Verified',
                title: 'Official Certificates',
                desc: 'Download PDF & PNG · Shareable credentials',
              },
              {
                icon: FileText,
                gradient: 'from-emerald-500 to-green-600',
                glow: 'shadow-emerald-500/15',
                tag: 'On Enrollment',
                title: 'Offer Letter Included',
                desc: 'Professional offer letter upon joining',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: 'easeOut' }}
                  whileHover={{ x: 4, y: -2 }}
                  className={`group relative flex items-center gap-4 p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.08] backdrop-blur-md shadow-md ${f.glow} hover:shadow-lg transition-all duration-300`}
                >
                  <div className={`relative w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg ${f.glow}`}>
                    <Icon className="w-5.5 h-5.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase bg-gradient-to-r ${f.gradient} bg-clip-text text-transparent border border-current/20`}>
                        {f.tag}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{f.title}</h4>
                    <p className="text-[11.5px] font-medium text-slate-500 dark:text-white/35 mt-0.5">{f.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-white/10 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Bottom trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center gap-3 pt-3 border-t border-slate-200/50 dark:border-white/[0.06]"
          >
            <div className="flex -space-x-2">
              {['from-primary-400 to-secondary-500','from-violet-400 to-fuchsia-500','from-sky-400 to-cyan-500'].map((g,i)=>(
                <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-white dark:border-[#0b0b0b] shadow-sm`} />
              ))}
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_,i)=>(
                  <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-amber-400"><path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.5L6 22l1.5-7.2L2 10l7.1-1.1z"/></svg>
                ))}
              </div>
              <p className="text-[10.5px] font-semibold text-slate-500 dark:text-white/35 mt-0.5">Trusted by 10,000+ interns</p>
            </div>
          </motion.div>
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
