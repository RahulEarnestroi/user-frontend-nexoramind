import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Award, FileText, ArrowRight,
  Loader2, User, Mail, Calendar, Shield,
  ChevronRight, CheckCircle2, Rocket, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { api, extractList } from '../../services/api';

function formatDuration(raw) {
  if (!raw) return '';
  const m = raw.match(/^(\d+)\s*(month|months|mo)$/i);
  if (m) { const n = parseInt(m[1], 10); return `${n} ${n === 1 ? 'Month' : 'Months'}`; }
  return raw;
}

function formatDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

export default function DashboardPage() {
  const { user } = useAuth();
  const { profileData, meStatus } = useProfile();
  const [certs, setCerts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = profileData?.full_name || user?.full_name || user?.FullName || 'User';
  const userId = profileData?.user_id || user?.user_id || user?.UserID || '';
  const email = profileData?.email || user?.email || '';
  const createdAt = profileData?.created_at || user?.created_at || '';
  const initial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    Promise.allSettled([
      api.listCertificates(),
      api.listOfferLetters(),
    ]).then(([certRes, olRes]) => {
      if (certRes.status === 'fulfilled') setCerts(extractList(certRes.value, 'certificates', 'data', 'result'));
      if (olRes.status === 'fulfilled') setOffers(extractList(olRes.value, 'offer_letters', 'data', 'result'));
    }).finally(() => setLoading(false));
  }, []);

  const totalItems = certs.length + offers.length;

  return (
    <div className="min-h-screen bg-[#f4f5f7] dark:bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ═══ Welcome ═══ */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-white/25 uppercase tracking-[0.2em]">{getGreeting()}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-lg font-extrabold text-white shadow-lg shadow-slate-900/10 dark:shadow-black/30">
                {initial}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#f4f5f7] dark:border-[#09090b] flex items-center justify-center">
                <CheckCircle2 className="w-2 h-2 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-[22px] sm:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{userName}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {userId && <span className="text-[11px] font-medium text-slate-400 dark:text-white/30">{userId}</span>}
                {email && <><span className="text-slate-200 dark:text-white/10">·</span><span className="text-[11px] font-medium text-slate-400 dark:text-white/30">{email}</span></>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ Stats Row ═══ */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {/* Certificates - Amber */}
          <motion.div variants={fadeUp}>
            <Link to="/certificates-list" className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/25 hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.1] rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/[0.05] rounded-full translate-y-6 -translate-x-6" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/[0.2] flex items-center justify-center mb-4">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <p className="text-[32px] font-extrabold text-white leading-none">{loading ? <Loader2 className="w-7 h-7 animate-spin opacity-40" /> : certs.length}</p>
                <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mt-1">Certificates</p>
              </div>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>

          {/* Offer Letters - Emerald */}
          <motion.div variants={fadeUp}>
            <Link to="/offer-letters" className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-5 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.1] rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/[0.05] rounded-full translate-y-6 -translate-x-6" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/[0.2] flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <p className="text-[32px] font-extrabold text-white leading-none">{loading ? <Loader2 className="w-7 h-7 animate-spin opacity-40" /> : offers.length}</p>
                <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mt-1">Offer Letters</p>
              </div>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>

          {/* Account - Green / Slate */}
          <motion.div variants={fadeUp}>
            <div className={`group block relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${meStatus ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/20' : 'bg-white dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]'}`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.1] rounded-full -translate-y-8 translate-x-8" />
              <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${meStatus ? 'bg-white/[0.2]' : 'bg-green-50 dark:bg-green-500/[0.06]'}`}>
                  <Shield className={`w-5 h-5 ${meStatus ? 'text-white' : 'text-green-500'}`} />
                </div>
                <p className={`text-[32px] font-extrabold leading-none ${meStatus ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {loading ? <Loader2 className="w-7 h-7 animate-spin opacity-20" /> : meStatus ? 'Active' : 'Off'}
                </p>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mt-1 ${meStatus ? 'text-white/60' : 'text-slate-400 dark:text-white/25'}`}>Account</p>
              </div>
            </div>
          </motion.div>

          {/* Programs */}
          <motion.div variants={fadeUp}>
            <Link to="/internships" className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 dark:from-white/[0.08] dark:to-white/[0.03] p-5 shadow-lg shadow-slate-900/15 dark:shadow-black/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-white/[0.08]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.06] rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/[0.03] rounded-full translate-y-6 -translate-x-6" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/[0.12] flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <p className="text-[32px] font-extrabold text-white leading-none">{loading ? <Loader2 className="w-7 h-7 animate-spin opacity-40" /> : totalItems}</p>
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mt-1">Programs</p>
              </div>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ═══ Two Column Layout ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Left: Quick Access (2 cols) ── */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="lg:col-span-2 space-y-4">
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-1">
              <h2 className="text-[11px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-[0.18em]">Quick Access</h2>
              <div className="flex-1 h-px bg-slate-200/50 dark:bg-white/[0.04]" />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { to: '/internships', icon: Briefcase, label: 'Internships', desc: 'Browse & enroll', gradient: 'from-slate-800 to-slate-950 dark:from-[#222] dark:to-[#181818]', shadow: 'shadow-slate-900/15' },
                { to: '/certificates-list', icon: Award, label: 'Certificates', desc: 'Your earned certs', gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/15' },
                { to: '/offer-letters', icon: FileText, label: 'Offer Letters', desc: 'Download offers', gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/15' },
              ].map((item) => (
                <motion.div key={item.to} variants={fadeUp}>
                  <Link to={item.to} className="group block relative overflow-hidden rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/50 dark:border-white/[0.05] p-5 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-white/[0.02] transition-all duration-300">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} ${item.shadow} flex items-center justify-center shadow-lg mb-4 group-hover:scale-105 transition-transform`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-0.5">{item.label}</h3>
                    <p className="text-[11px] text-slate-400 dark:text-white/30">{item.desc}</p>
                    <ArrowRight className="absolute top-5 right-5 w-4 h-4 text-slate-300 dark:text-white/15 group-hover:text-slate-500 dark:group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* User Info Card */}
            <motion.div variants={fadeUp} className="rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/50 dark:border-white/[0.05] p-5">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-[0.18em] mb-4">Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: User, label: 'User ID', value: userId || '—' },
                  { icon: Mail, label: 'Email', value: email || '—' },
                  { icon: Calendar, label: 'Member Since', value: createdAt ? formatDate(createdAt) : '—' },
                  { icon: Shield, label: 'Status', value: meStatus ? 'Active' : 'Inactive' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100/50 dark:border-white/[0.04]">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-slate-400 dark:text-white/25" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-white/20 uppercase tracking-wider">{item.label}</p>
                      <p className="text-[12px] font-semibold text-slate-700 dark:text-white/70 truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Recent Activity (1 col) ── */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
            {/* Certificates */}
            {certs.length > 0 && (
              <motion.div variants={fadeUp} className="rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/50 dark:border-white/[0.05] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100/60 dark:border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[12px] font-bold text-slate-900 dark:text-white">Certificates</span>
                  </div>
                  <Link to="/certificates-list" className="text-[10px] font-semibold text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/50 transition-colors">View all</Link>
                </div>
                <div className="divide-y divide-slate-100/40 dark:divide-white/[0.03]">
                  {certs.slice(0, 3).map((c, i) => {
                    const roleName = c.RoleName ?? c.role_name ?? c.roleName ?? c.RoleID ?? '';
                    const duration = c.DurationDisplay ?? c.duration_display ?? formatDuration(c.Duration ?? c.duration ?? '');
                    return (
                      <Link key={c.CertificateID ?? i} to="/certificates-list" className="group flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/[0.06] flex items-center justify-center shrink-0">
                          <Award className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-slate-900 dark:text-white truncate">{roleName}</p>
                          <p className="text-[10px] text-slate-400 dark:text-white/20">{duration}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-white/10 shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Offer Letters */}
            {offers.length > 0 && (
              <motion.div variants={fadeUp} className="rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/50 dark:border-white/[0.05] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100/60 dark:border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[12px] font-bold text-slate-900 dark:text-white">Offer Letters</span>
                  </div>
                  <Link to="/offer-letters" className="text-[10px] font-semibold text-slate-400 dark:text-white/25 hover:text-slate-600 dark:hover:text-white/50 transition-colors">View all</Link>
                </div>
                <div className="divide-y divide-slate-100/40 dark:divide-white/[0.03]">
                  {offers.slice(0, 3).map((ol, i) => {
                    const roleName = ol.RoleName ?? ol.role_name ?? ol.roleName ?? ol.RoleID ?? '';
                    const duration = ol.DurationDisplay ?? ol.duration_display ?? formatDuration(ol.Duration ?? ol.duration ?? '');
                    return (
                      <Link key={ol.OfferLetterID ?? i} to="/offer-letters" className="group flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/[0.06] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-slate-900 dark:text-white truncate">{roleName}</p>
                          <p className="text-[10px] text-slate-400 dark:text-white/20">{duration}</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-white/10 shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {!loading && totalItems === 0 && (
              <motion.div variants={fadeUp} className="rounded-2xl bg-white dark:bg-[#111111] border border-slate-200/50 dark:border-white/[0.05] p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                  <Rocket className="w-5 h-5 text-slate-400 dark:text-white/20" />
                </div>
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-white mb-1">No Activity Yet</h3>
                <p className="text-[11px] text-slate-400 dark:text-white/30 mb-4">Enroll in an internship to get started.</p>
                <Link to="/internships" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black text-[11px] font-bold hover:shadow-lg transition-all">
                  Get Started <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}