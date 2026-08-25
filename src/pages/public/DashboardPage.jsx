import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Award, FileText, ArrowRight,
  Loader2, User, Mail, Calendar, Shield, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { api, extractList } from '../../services/api';

function formatDuration(raw) {
  if (!raw) return '';
  const m = raw.match(/^(\d+)\s*(month|months|mo)$/i);
  if (m) {
    const n = parseInt(m[1], 10);
    return `${n} ${n === 1 ? 'Month' : 'Months'}`;
  }
  return raw;
}

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
      if (certRes.status === 'fulfilled') {
        const raw = extractList(certRes.value, 'certificates', 'data', 'result');
        setCerts(raw);
      }
      if (olRes.status === 'fulfilled') {
        const raw = extractList(olRes.value, 'offer_letters', 'data', 'result');
        setOffers(raw);
      }
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Certificates', value: certs.length, icon: Award, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-500/15' },
    { label: 'Offer Letters', value: offers.length, icon: FileText, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-500/15' },
    { label: 'Account Status', value: meStatus ? 'Active' : 'Inactive', icon: Shield, color: meStatus ? 'from-green-500 to-emerald-500' : 'from-slate-400 to-slate-500', bg: meStatus ? 'bg-green-50 dark:bg-green-500/10' : 'bg-slate-50 dark:bg-slate-500/10', text: meStatus ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400', border: meStatus ? 'border-green-100 dark:border-green-500/15' : 'border-slate-100 dark:border-slate-500/15' },
  ];

  const actions = [
    { to: '/internships', icon: Briefcase, label: 'Browse Internships', desc: 'Explore available internship roles and enroll', color: 'from-primary-500 to-primary-600' },
    { to: '/certificates-list', icon: Award, label: 'View Certificates', desc: 'Access your earned certificates', color: 'from-amber-500 to-orange-500' },
    { to: '/offer-letters', icon: FileText, label: 'View Offer Letters', desc: 'Check your offer letters and details', color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 p-6 sm:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.06] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/[0.04] rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shadow-lg border border-white/20 shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-white/60" />
              <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Welcome back</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{userName}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
              {userId && (
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> {userId}
                </span>
              )}
              {email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {email}
                </span>
              )}
              {createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Joined {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={`p-5 rounded-2xl ${stat.bg} border ${stat.border} flex items-center gap-4`}
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stat.text}`}>{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-white/40 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {actions.map((action, i) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Link
                to={action.to}
                className="group block p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm mb-3`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {action.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-white/40 mb-3">{action.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
                  Go <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Certificates */}
      {!loading && certs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Certificates</h2>
            <Link to="/certificates-list" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {certs.slice(0, 3).map((c, i) => {
              const roleName = c.RoleName ?? c.role_name ?? c.roleName ?? c.RoleID ?? '';
              const duration = c.DurationDisplay ?? c.duration_display ?? formatDuration(c.Duration ?? c.duration ?? '');
              const dateRange = c.DateRange ?? c.date_range ?? '';
              return (
                <div key={c.CertificateID ?? c.certificate_id ?? i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/15 flex items-center justify-center">
                      <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{roleName}</p>
                      <p className="text-[11px] text-slate-400 dark:text-white/30">{duration} {dateRange && `\u00B7 ${dateRange}`}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/15">
                    Issued
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Offer Letters */}
      {!loading && offers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Offer Letters</h2>
            <Link to="/offer-letters" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {offers.slice(0, 3).map((ol, i) => {
              const roleName = ol.RoleName ?? ol.role_name ?? ol.roleName ?? ol.RoleID ?? '';
              const duration = ol.DurationDisplay ?? ol.duration_display ?? formatDuration(ol.Duration ?? ol.duration ?? '');
              const dateRange = ol.StartEndDate ?? ol.start_end_date ?? '';
              return (
                <div key={ol.OfferLetterID ?? ol.offer_letter_id ?? i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/15 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{roleName}</p>
                      <p className="text-[11px] text-slate-400 dark:text-white/30">{duration} {dateRange && `\u00B7 ${dateRange}`}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/15">
                    Delivered
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && certs.length === 0 && offers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-slate-300 dark:text-white/15" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 dark:text-white/70 mb-1">No Enrollments Yet</h3>
          <p className="text-sm text-slate-400 dark:text-white/35 mb-4">Start your journey by enrolling in an internship program.</p>
          <Link
            to="/internships"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary-500/20"
          >
            Browse Internships <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
