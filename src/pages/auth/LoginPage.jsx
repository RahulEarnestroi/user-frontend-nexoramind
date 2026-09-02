import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Eye, EyeOff, ArrowRight, Key, Loader2, ArrowLeft,
  CheckCircle2, Award, FileText, Briefcase, Sparkles, Shield,
  Zap, Users
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { api } from '../../services/api';
import Logo from '../../assets/Logo.png';
import LogoSmall from '../../assets/logo_small.png';

function validatePassword(p) {
  if (!p || p.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(p)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(p)) return 'Password must contain at least one lowercase letter';
  if (!/\d/.test(p)) return 'Password must contain at least one number';
  return null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.25, ease: 'easeIn' } },
};

export default function LoginPage() {
  const { login } = useAuth();
  const { refreshProfile } = useProfile();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');

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

  const features = [
    { icon: Briefcase, gradient: 'from-sky-500 to-blue-600', tag: 'Live Programs', title: 'Real Internship Roles', desc: 'Frontend · Backend · Data Science · Design' },
    { icon: Award, gradient: 'from-violet-500 to-purple-600', tag: 'Verified', title: 'Official Certificates', desc: 'Download PDF & PNG · Shareable credentials' },
    { icon: FileText, gradient: 'from-emerald-500 to-green-600', tag: 'On Enrollment', title: 'Offer Letter Included', desc: 'Professional offer letter upon joining' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080808] flex transition-colors duration-300">
      {/* ─── Left Visual Panel ─── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden items-center justify-center">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-[#0a0a1a] dark:via-[#080810] dark:to-[#0d0818]" />
        <div className="absolute inset-0 bg-grid opacity-[0.3] dark:opacity-[0.06]" />
        <div className="absolute inset-0 bg-mesh" />

        {/* Animated orbs */}
        <motion.div
          animate={{ y: [0, -24, 0], x: [0, 8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[8%] right-[12%] w-[340px] h-[340px] rounded-full opacity-70 dark:opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(0,128,248,0.18) 0%, transparent 70%)', filter: 'blur(1px)' }}
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -6, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-[12%] left-[6%] w-[280px] h-[280px] rounded-full opacity-60 dark:opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(112,40,192,0.16) 0%, transparent 70%)', filter: 'blur(1px)' }}
        />
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute top-[52%] left-[38%] w-[200px] h-[200px] rounded-full opacity-50 dark:opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(0,128,248,0.10) 0%, transparent 70%)', filter: 'blur(2px)' }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-[520px] px-14 flex flex-col gap-10">
          {/* Logo + Brand */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="flex items-center gap-3.5"
          >
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-primary-500/25 to-secondary-500/25 blur-lg" />
              <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/[0.1] shadow-lg shadow-primary-500/10 dark:shadow-primary-500/5 flex items-center justify-center backdrop-blur-sm">
                <img src={LogoSmall} alt="NexoraMind" className="w-8 h-8 object-contain" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  NexoraMind
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-primary-500/12 to-secondary-500/12 dark:from-primary-400/15 dark:to-secondary-400/15 text-primary-700 dark:text-primary-300 border border-primary-500/15 dark:border-primary-400/15 uppercase tracking-widest">
                  Tech
                </span>
              </div>
              <p className="mt-1 text-[11px] font-semibold text-slate-400 dark:text-white/25 tracking-wide uppercase">
                Internship · Certification · Careers
              </p>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.5}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500/30" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-white/55 tracking-wide">
                Your Career Journey Starts Here
              </span>
            </div>
            <h2 className="text-[38px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Build real projects.<br />
              Earn{' '}
              <span className="text-gradient">
                verified
              </span>{' '}
              certificates.
            </h2>
            <p className="text-[14.5px] leading-relaxed text-slate-500 dark:text-white/35 font-medium max-w-[420px]">
              Join structured internship programs with hands-on tasks, automated reviews, and verified credentials employers trust.
            </p>
          </motion.div>

          {/* Feature cards */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="space-y-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={1.5 + i * 0.2}
                  whileHover={{ x: 5, y: -2 }}
                  className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.07] backdrop-blur-md shadow-sm dark:shadow-none hover:shadow-md dark:hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div className={`relative w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-gradient-to-r ${f.gradient} bg-clip-text text-transparent mb-0.5`}>
                      {f.tag}
                    </span>
                    <h4 className="text-[13.5px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                      {f.title}
                    </h4>
                    <p className="text-[11.5px] font-medium text-slate-500 dark:text-white/30 mt-0.5">
                      {f.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-white/10 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex items-center gap-4 pt-4 border-t border-slate-200/40 dark:border-white/[0.06]"
          >
            <div className="flex -space-x-2.5">
              {['from-primary-400 to-secondary-500', 'from-violet-400 to-fuchsia-500', 'from-sky-400 to-cyan-500'].map((g, i) => (
                <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-white dark:border-[#0b0b0b] shadow-sm`} />
              ))}
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
                    <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.5L6 22l1.5-7.2L2 10l7.1-1.1z" />
                  </svg>
                ))}
                <span className="text-[11px] font-bold text-slate-600 dark:text-white/50 ml-1">5.0</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-white/30 mt-0.5">
                Trusted by 10,000+ interns
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div className="flex-1 flex items-center justify-center py-10 px-4 sm:px-8 relative">
        {/* Subtle background for light mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/50 to-slate-50 dark:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 blur-md" />
                <div className="relative w-11 h-11 rounded-xl bg-white dark:bg-white/[0.07] border border-slate-200/60 dark:border-white/[0.1] shadow-md flex items-center justify-center">
                  <img src={Logo} alt="NexoraMind Tech" className="w-6 h-6 object-contain" />
                </div>
              </div>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">NexoraMind</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {mode === 'login' ? 'Welcome back' : 'Reset password'}
            </h1>
            <p className="text-[14px] text-slate-500 dark:text-white/35 mt-2 font-medium">
              {mode === 'login'
                ? 'Sign in to access your dashboard'
                : 'Verify your identity and set a new password'}
            </p>
          </div>

          {/* Form card */}
          <div className="relative bg-white dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.07] rounded-2xl p-7 sm:p-8 shadow-lg shadow-slate-200/40 dark:shadow-black/20 backdrop-blur-sm">
            {/* Subtle top gradient accent */}
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

            <AnimatePresence mode="wait">
              {mode === 'login' && (
                <motion.form
                  key="login"
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-red-50 dark:bg-red-500/[0.08] border border-red-200/70 dark:border-red-500/15 rounded-xl text-[13px] text-red-600 dark:text-red-400 font-medium flex items-start gap-2"
                    >
                      <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700 dark:text-white/50">
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-[14px] placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10 dark:focus:border-primary-400/30 dark:focus:ring-primary-400/10 transition-all duration-200"
                      />
                      <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/20 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700 dark:text-white/50">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-[14px] placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10 dark:focus:border-primary-400/30 dark:focus:ring-primary-400/10 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/50 transition-colors rounded-md"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[12.5px] font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-[14px] font-semibold shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10 hover:shadow-xl hover:shadow-primary-500/25 dark:hover:shadow-primary-500/15 hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100"
                  >
                    {loading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-5 border-t border-slate-100 dark:border-white/[0.06] text-center">
                    <p className="text-[13.5px] text-slate-500 dark:text-white/35">
                      Don't have an account?{' '}
                      <Link
                        to="/register"
                        className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </motion.form>
              )}

              {mode === 'forgot' && (
                <motion.form
                  key="forgot"
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleResetPassword}
                  className="space-y-5"
                >
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 transition-colors -mt-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Sign In
                  </button>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-red-50 dark:bg-red-500/[0.08] border border-red-200/70 dark:border-red-500/15 rounded-xl text-[13px] text-red-600 dark:text-red-400 font-medium flex items-start gap-2"
                    >
                      <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700 dark:text-white/50">
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setOtpSent(false); }}
                        required
                        disabled={otpSent}
                        className="w-full pl-4 pr-32 py-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-[14px] placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10 dark:focus:border-primary-400/30 dark:focus:ring-primary-400/10 transition-all duration-200 disabled:opacity-55 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading || otpCooldown > 0}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 text-[11.5px] font-bold border border-primary-500/15 dark:border-primary-400/15 hover:bg-primary-500/15 dark:hover:bg-primary-400/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {loading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : otpCooldown > 0 ? (
                          `${otpCooldown}s`
                        ) : otpSent ? (
                          'Resend'
                        ) : (
                          'Send OTP'
                        )}
                      </button>
                    </div>
                    {otpSent && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-[11.5px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 mt-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        OTP sent to {email}. Check your inbox.
                      </motion.p>
                    )}
                  </div>

                  {/* OTP */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-slate-700 dark:text-white/50 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      OTP Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      disabled={!otpSent}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-[16px] tracking-[0.35em] placeholder:tracking-[0.35em] placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10 dark:focus:border-primary-400/30 dark:focus:ring-primary-400/10 transition-all duration-200 text-center font-mono font-bold disabled:opacity-45 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700 dark:text-white/50">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Min 8 chars, upper, lower & number"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={!otpSent}
                        className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-[14px] placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10 dark:focus:border-primary-400/30 dark:focus:ring-primary-400/10 transition-all duration-200 disabled:opacity-45 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/50 transition-colors rounded-md"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700 dark:text-white/50">
                      Confirm New Password
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      disabled={!otpSent}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-[14px] placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10 dark:focus:border-primary-400/30 dark:focus:ring-primary-400/10 transition-all duration-200 disabled:opacity-45 disabled:cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !otpSent}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-[14px] font-semibold shadow-lg shadow-primary-500/20 dark:shadow-primary-500/10 hover:shadow-xl hover:shadow-primary-500/25 dark:hover:shadow-primary-500/15 hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100"
                  >
                    {loading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer text */}
          <p className="text-center text-[11.5px] text-slate-400 dark:text-white/20 mt-6 font-medium">
            By continuing, you agree to NexoraMind's{' '}
            <span className="text-primary-600/70 dark:text-primary-400/50 cursor-pointer hover:underline">Terms</span>
            {' '}&{' '}
            <span className="text-primary-600/70 dark:text-primary-400/50 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
