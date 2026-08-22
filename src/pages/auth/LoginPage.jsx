import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Logo from '../../assets/Logo.png';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { const user = login(email, password); navigate(user.role === 'ADMIN' || user.role === 'ISSUER' ? '/admin/dashboard' : '/student/dashboard'); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setError(''); setLoading(true);
    try { const user = await loginWithGoogle(); navigate(user.role === 'ADMIN' || user.role === 'ISSUER' ? '/admin/dashboard' : '/student/dashboard'); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
            <p className="text-slate-500 dark:text-white/40 mt-1 font-normal">Sign in to your account</p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">{error}</div>}
              <div className="relative">
                <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Mail className="absolute right-3 top-9 w-4 h-4 text-slate-400 dark:text-white/25 pointer-events-none" />
              </div>
              <div className="relative">
                <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 p-0.5 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" className="w-full text-white" size="lg" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" /></Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" />
              <span className="text-xs text-slate-400 dark:text-white/30 font-medium">or continue with</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.06]" />
            </div>

            <button onClick={handleGoogleLogin} disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-medium text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:border-slate-300 dark:hover:border-white/[0.15] transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/[0.06] text-center">
              <p className="text-sm text-slate-500 dark:text-white/40">Don't have an account? <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign up</Link></p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
