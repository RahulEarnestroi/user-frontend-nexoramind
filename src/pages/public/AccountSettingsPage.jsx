import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Key, Eye, EyeOff, Loader2,
  CheckCircle2, Lock, ArrowRight, User, Mail, Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { api } from '../../services/api';

function formatDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function validatePassword(p) {
  if (!p || p.length < 8) return 'At least 8 characters';
  if (!/[A-Z]/.test(p)) return 'Need uppercase letter';
  if (!/[a-z]/.test(p)) return 'Need lowercase letter';
  if (!/\d/.test(p)) return 'Need number';
  return null;
}

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const { profileData } = useProfile();

  const userName = profileData?.full_name || user?.full_name || user?.FullName || 'User';
  const userId = profileData?.user_id || user?.user_id || user?.UserID || '';
  const email = profileData?.email || user?.email || '';
  const createdAt = profileData?.created_at || user?.created_at || '';

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword) { toast.error('Please enter your current password'); return; }
    const pwErr = validatePassword(newPassword);
    if (pwErr) { toast.error(pwErr); return; }
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return; }
    if (oldPassword === newPassword) { toast.error('New password must differ from old'); return; }
    setLoading(true);
    try {
      const res = await api.changePassword(oldPassword, newPassword);
      toast.success(res.message || res.Message || 'Password changed successfully!');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      setShowOld(false); setShowNew(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strengthScore = (() => {
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[a-z]/.test(newPassword)) s++;
    if (/\d/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();

  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-emerald-500',
  ];
  const strengthTextColors = [
    'text-red-600 dark:text-red-400',
    'text-orange-600 dark:text-orange-400',
    'text-amber-600 dark:text-amber-400',
    'text-yellow-600 dark:text-yellow-400',
    'text-green-600 dark:text-green-400',
    'text-emerald-600 dark:text-emerald-400',
  ];

  return (
    <div className="min-h-screen bg-[#f4f5f7] dark:bg-[#09090b] py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-[0.2em]">Account</span>
          </div>
          <h1 className="text-[22px] sm:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-[13px] text-slate-400 dark:text-white/30 mt-1">Manage your account security and preferences</p>
        </motion.div>

        {/* Profile Info Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/50 dark:border-white/[0.05] p-5 sm:p-6 mb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-white/[0.04] ring-1 ring-slate-200/50 dark:ring-white/[0.06] flex items-center justify-center">
              <Shield className="w-4 h-4 text-slate-500 dark:text-white/40" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-slate-900 dark:text-white">Profile Information</h2>
              <p className="text-[11px] text-slate-400 dark:text-white/25">Your account details</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: User, label: 'Full Name', value: userName },
              { icon: Mail, label: 'Email', value: email },
              { icon: Lock, label: 'User ID', value: userId },
              { icon: Calendar, label: 'Member Since', value: createdAt ? formatDate(createdAt) : '—' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100/50 dark:border-white/[0.04]">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/[0.04] ring-1 ring-slate-200/50 dark:ring-white/[0.06] flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-slate-400 dark:text-white/25" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-white/20 uppercase tracking-wider">{item.label}</p>
                  <p className="text-[12px] font-semibold text-slate-700 dark:text-white/70 truncate">{item.value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Change Password Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/50 dark:border-white/[0.05] p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-500/[0.06] ring-1 ring-primary-100 dark:ring-primary-500/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-slate-900 dark:text-white">Change Password</h2>
              <p className="text-[11px] text-slate-400 dark:text-white/25">Keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Old Password */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 dark:text-white/60 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  placeholder="Enter your current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all"
                />
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 transition-colors">
                  {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 dark:text-white/60 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="At least 8 chars, letters & numbers"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 transition-colors">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Meter */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className={`h-1 w-8 rounded-full transition-all ${i < strengthScore ? strengthColors[strengthScore] : 'bg-slate-100 dark:bg-white/[0.05]'}`} />
                      ))}
                    </div>
                    <span className={`text-[10px] font-bold ${strengthTextColors[strengthScore]}`}>
                      {strengthLabels[strengthScore]}
                    </span>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {newPassword && (
                <div className="grid grid-cols-2 gap-y-1 mt-2.5">
                  {[
                    { label: '8+ characters', ok: newPassword.length >= 8 },
                    { label: 'Uppercase letter', ok: /[A-Z]/.test(newPassword) },
                    { label: 'Lowercase letter', ok: /[a-z]/.test(newPassword) },
                    { label: 'Number', ok: /\d/.test(newPassword) },
                  ].map((req) => (
                    <div key={req.label} className="flex items-center gap-1.5">
                      {req.ok ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-slate-200 dark:border-white/10 shrink-0" />
                      )}
                      <span className={`text-[10px] ${req.ok ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-400 dark:text-white/20'}`}>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 dark:text-white/60 mb-1.5">Confirm New Password</label>
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-50/50 dark:bg-white/[0.03] border text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none transition-all ${
                  confirmPassword
                    ? (confirmPassword === newPassword ? 'border-green-300 dark:border-green-500/30 focus:border-green-500/40 focus:ring-green-500/20' : 'border-red-300 dark:border-red-500/30 focus:border-red-500/40 focus:ring-red-500/20')
                    : 'border-slate-200 dark:border-white/[0.06] focus:border-primary-500/40 focus:ring-primary-500/20'
                }`}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="mt-1 text-[10px] font-semibold text-red-500">Passwords do not match</p>
              )}
              {confirmPassword && confirmPassword === newPassword && newPassword && (
                <p className="mt-1 text-[10px] font-semibold text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Passwords match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Update Password <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}