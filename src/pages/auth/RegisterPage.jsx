import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Sparkles, Mail, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import Logo from '../../assets/Logo.png';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { refreshProfile } = useProfile();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.warning('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(email, fullName, password);
      await refreshProfile();
      navigate('/internships');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex">
      {/* Left Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 dark:bg-white/[0.02] relative overflow-hidden items-center justify-center border-r border-slate-200 dark:border-white/[0.06]">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[400px] h-[400px] bg-secondary-500/8 rounded-full blur-[80px]" />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary-500/25">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Start Your Journey</h2>
          <p className="text-slate-500 dark:text-white/40 leading-relaxed max-w-sm mx-auto font-normal">Create an account to access certifications, internships, and advance your career with verified credentials.</p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6"><img src={Logo} alt="NexoraMind Tech" className="h-9 w-auto" /></Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create your account</h1>
            <p className="text-slate-500 dark:text-white/40 mt-1 font-normal">Start your certification journey</p>
          </div>

          <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/60 mb-1.5">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all"
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/25 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/60 mb-1.5">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
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
                    placeholder="Min. 6 characters"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/[0.06] text-center">
              <p className="text-sm text-slate-500 dark:text-white/40">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
