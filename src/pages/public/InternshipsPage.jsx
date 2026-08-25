import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Server, Layout, Brain, Database, Code, Globe,
  Loader2, AlertCircle, CheckCircle2, Clock,
  Eye, Award, FileText, ArrowRight, X,
  Sparkles, Zap, Users, Trophy, SlidersHorizontal, Search,
  CalendarDays, Star, Filter, RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { api, extractList } from '../../services/api';

const iconMap = {
  server: Server, layout: Layout, brain: Brain, database: Database,
  code: Code, globe: Globe, briefcase: Briefcase,
};

function formatDuration(raw) {
  if (!raw) return '';
  if (/\s/.test(raw) && /[A-Z]/.test(raw)) return raw;
  const m = raw.match(/^(\d+)\s*(month|months|mo)$/i);
  if (m) { const n = parseInt(m[1], 10); return `${n} ${n === 1 ? 'Month' : 'Months'}`; }
  return raw;
}

function getDurationMonths(raw) {
  if (!raw) return 0;
  const m = raw.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function getTierLabel(durationRaw) {
  const months = getDurationMonths(durationRaw);
  if (months <= 1) return { label: 'Starter', accent: 'from-sky-500 to-blue-500', bg: 'bg-sky-50 dark:bg-sky-500/[0.08]', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-100 dark:border-sky-500/20', desc: '1 Month Certificate' };
  if (months <= 3) return { label: 'Professional', accent: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-500/[0.08]', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-500/20', desc: '3 Month Certificate' };
  return { label: 'Advanced', accent: 'from-rose-500 to-pink-500', bg: 'bg-rose-50 dark:bg-rose-500/[0.08]', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-500/20', desc: `${months} Month Certificate` };
}

function getRandom4(arr, seed = '') {
  if (!arr || arr.length === 0) return [];
  if (arr.length <= 4) return arr;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const shuffled = [...arr].sort((a, b) => {
    const ha = 0, hb = 0;
    for (let i = 0; i < a.length; i++) h = (h * 17 + a.charCodeAt(i)) >>> 0;
    const ra = (h + ha) % arr.length;
    for (let i = 0; i < b.length; i++) h = (h * 17 + b.charCodeAt(i)) >>> 0;
    const rb = (h + hb) % arr.length;
    return ra - rb;
  });
  return shuffled.slice(0, 4);
}

function normalizeRole(r) {
  return {
    roleId: r.RoleID ?? r.role_id ?? '',
    name: r.Name ?? r.name ?? r.role_name ?? '',
    description: r.Description ?? r.description ?? '',
    icon: r.Icon ?? r.icon ?? 'briefcase',
    color: r.Color ?? r.color ?? '#6366f1',
    skills: r.Skills ?? r.skills ?? [],
    durations: (r.Durations ?? r.durations ?? []).map(d => ({
      duration: d.Duration ?? d.duration ?? '',
      taskCount: d.TaskCount ?? d.task_count ?? 0,
      label: (d.Label ?? d.label ?? '') || formatDuration(d.Duration ?? d.duration ?? ''),
    })),
    status: r.Status ?? r.status ?? 'ACTIVE',
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function InternshipsPage() {
  const { isAuthenticated } = useAuth();
  const { meStatus } = useProfile();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const [search, setSearch] = useState('');
  const [filterDuration, setFilterDuration] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const rolesData = await api.getRoles();
        const rawRoles = extractList(rolesData, 'roles', 'data', 'result');
        setRoles(rawRoles.map(normalizeRole).filter(r => r.status.toUpperCase() === 'ACTIVE'));
        if (isAuthenticated) {
          try {
            const enrollData = await api.listInternships();
            setEnrollments(extractList(enrollData, 'internships', 'data', 'result'));
          } catch { setEnrollments([]); }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [isAuthenticated]);

  const enrollmentMap = {};
  enrollments.forEach(e => {
    const rid = e.RoleID ?? e.role_id ?? '';
    const dur = e.Duration ?? e.duration ?? '';
    enrollmentMap[`${rid}-${dur}`] = {
      roleId: rid, roleName: e.RoleName ?? e.role_name ?? rid, duration: dur,
      durationDisplay: e.DurationDisplay ?? e.duration_display ?? formatDuration(dur),
      status: e.Status ?? e.status ?? 'IN_PROGRESS', totalTasks: e.TotalTasks ?? e.total_tasks ?? 0,
      allTasksCompleted: e.AllTasksCompleted ?? e.all_tasks_completed ?? false,
      certificationGenerated: e.CertificationGenerated ?? e.certification_generated ?? false,
      enrolledAt: e.EnrolledAt ?? e.enrolled_at ?? '', completion: e.Completion ?? {},
      offerLetter: e.OfferLetter ?? null, certificate: e.Certificate ?? null,
    };
  });

  const rawCards = useMemo(() => {
    const out = [];
    roles.forEach(role => {
      role.durations.forEach(d => {
        const key = `${role.roleId}-${d.duration}`;
        out.push({
          key, roleId: role.roleId, roleName: role.name, duration: d.duration,
          durationLabel: d.label || formatDuration(d.duration), taskCount: d.taskCount,
          description: role.description, skills: role.skills, icon: role.icon, color: role.color,
          enrollment: enrollmentMap[key] || null,
        });
      });
    });
    return out;
  }, [roles, enrollments]);

  const allRoles = useMemo(() => {
    const set = new Set();
    roles.forEach(r => set.add(r.name));
    return Array.from(set).sort();
  }, [roles]);

  const allDurations = useMemo(() => {
    const set = new Set();
    roles.forEach(r => r.durations.forEach(d => set.add(d.duration)));
    return Array.from(set).sort((a, b) => getDurationMonths(a) - getDurationMonths(b));
  }, [roles]);

  const filteredCards = useMemo(() => {
    return rawCards.filter(c => {
      if (search && !(
        c.roleName.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
      )) return false;
      if (filterDuration !== 'all' && c.duration !== filterDuration) return false;
      if (filterRole !== 'all' && c.roleName !== filterRole) return false;
      if (filterStatus !== 'all') {
        const isEnrolled = !!c.enrollment;
        const isCompleted = c.enrollment?.status === 'COMPLETED';
        if (filterStatus === 'enrolled' && !isEnrolled) return false;
        if (filterStatus === 'not_enrolled' && isEnrolled) return false;
        if (filterStatus === 'completed' && !isCompleted) return false;
        if (filterStatus === 'in_progress' && (!isEnrolled || isCompleted)) return false;
      }
      if (filterTier !== 'all') {
        const months = getDurationMonths(c.duration);
        if (filterTier === 'starter' && months > 1) return false;
        if (filterTier === 'professional' && (months < 2 || months > 3)) return false;
        if (filterTier === 'advanced' && months < 4) return false;
      }
      return true;
    });
  }, [rawCards, search, filterDuration, filterRole, filterStatus, filterTier]);

  const activeFiltersCount = [filterDuration, filterRole, filterStatus, filterTier].filter(f => f !== 'all').length;
  const totalEnrolled = rawCards.filter(c => c.enrollment).length;
  const totalCompleted = rawCards.filter(c => c.enrollment?.status === 'COMPLETED').length;

  const handleEnrollClick = (card) => {
    setConfirmModal({
      roleId: card.roleId, roleName: card.roleName, duration: card.duration,
      durationLabel: card.durationLabel, taskCount: card.taskCount,
    });
  };

  const handleConfirmEnroll = async () => {
    if (!confirmModal) return;
    const { roleId, roleName, duration, durationLabel } = confirmModal;
    setEnrollingId(`${roleId}-${duration}`);
    setConfirmModal(null);
    try {
      await api.enroll(roleId, duration);
      toast.success(`Enrolled in ${roleName} (${durationLabel})!`);
      const enrollData = await api.listInternships();
      setEnrollments(extractList(enrollData, 'internships', 'data', 'result'));
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('already enrolled')) {
        toast.info(`Already enrolled in ${roleName}. Refreshing...`);
        const enrollData = await api.listInternships();
        setEnrollments(extractList(enrollData, 'internships', 'data', 'result'));
      } else {
        toast.error(err.message || 'Enrollment failed');
      }
    } finally {
      setEnrollingId(null);
    }
  };

  const clearAllFilters = () => {
    setFilterDuration('all'); setFilterRole('all'); setFilterStatus('all'); setFilterTier('all'); setSearch('');
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#09090b]">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden bg-white dark:bg-[#111111] border-b border-slate-200/60 dark:border-white/[0.05]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary-500/[0.06] to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-500/[0.04] to-transparent rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-500/[0.08] border border-primary-100 dark:border-primary-500/15 mb-4">
              <Briefcase className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">Career Programs</span>
            </div>
            <h1 className="text-[32px] sm:text-[40px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">Internship Programs</h1>
            <p className="text-[14px] text-slate-500 dark:text-white/40 mt-2 max-w-2xl font-normal leading-relaxed">Launch your tech career with hands-on internships. Earn verified certificates and offer letters on completion.</p>

            {!loading && rawCards.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 mt-6">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-white/30" />
                  <span className="text-[12px] font-bold text-slate-900 dark:text-white">{rawCards.length}</span>
                  <span className="text-[11px] text-slate-400 dark:text-white/25">Programs</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                  <Users className="w-3.5 h-3.5 text-slate-400 dark:text-white/30" />
                  <span className="text-[12px] font-bold text-slate-900 dark:text-white">{totalEnrolled}</span>
                  <span className="text-[11px] text-slate-400 dark:text-white/25">Enrolled</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
                  <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">{totalCompleted}</span>
                  <span className="text-[11px] text-slate-400 dark:text-white/25">Completed</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Search + Filter Bar ── */}
        {!loading && !error && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6 space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/25" />
                <input
                  type="text"
                  placeholder="Search programs, skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-primary-500/30 focus:ring-2 focus:ring-primary-500/10 transition-all"
                />
              </div>

              {/* Toggle Filter button */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-[12px] transition-all ${
                  filtersOpen || activeFiltersCount > 0
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white'
                    : 'bg-white dark:bg-[#111111] text-slate-700 dark:text-white/60 border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold ${
                    filtersOpen ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' : 'bg-primary-500 text-white'
                  }`}>{activeFiltersCount}</span>
                )}
              </button>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/[0.06] shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Duration */}
                      <FilterSelect
                        label="Duration"
                        icon={<CalendarDays className="w-3.5 h-3.5" />}
                        value={filterDuration}
                        onChange={setFilterDuration}
                        options={[{ value: 'all', label: 'All Durations' }, ...allDurations.map(d => ({ value: d, label: formatDuration(d) }))]}
                      />
                      {/* Role */}
                      <FilterSelect
                        label="Role"
                        icon={<Briefcase className="w-3.5 h-3.5" />}
                        value={filterRole}
                        onChange={setFilterRole}
                        options={[{ value: 'all', label: 'All Roles' }, ...allRoles.map(r => ({ value: r, label: r }))]}
                      />
                      {/* Tier */}
                      <FilterSelect
                        label="Program Tier"
                        icon={<Star className="w-3.5 h-3.5" />}
                        value={filterTier}
                        onChange={setFilterTier}
                        options={[
                          { value: 'all', label: 'All Tiers' },
                          { value: 'starter', label: 'Starter (1 Month)' },
                          { value: 'professional', label: 'Professional (2-3 Months)' },
                          { value: 'advanced', label: 'Advanced (4+ Months)' },
                        ]}
                      />
                      {/* Enrollment Status */}
                      <FilterSelect
                        label="Enrollment"
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={[
                          { value: 'all', label: 'All Programs' },
                          { value: 'not_enrolled', label: 'Not Enrolled' },
                          { value: 'enrolled', label: 'Enrolled (All)' },
                          { value: 'in_progress', label: 'In Progress' },
                          { value: 'completed', label: 'Completed' },
                        ]}
                      />
                    </div>
                    {activeFiltersCount > 0 && (
                      <div className="flex justify-end mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
                        <button onClick={clearAllFilters} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-500 dark:text-white/35 hover:text-slate-700 dark:hover:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all">
                          <RefreshCw className="w-3 h-3" /> Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
              <div className="absolute inset-0 w-10 h-10 rounded-full bg-primary-500/10 animate-ping" />
            </div>
            <p className="text-slate-400 dark:text-white/30 text-sm mt-4 font-medium">Loading internship programs...</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-white dark:bg-[#111111] rounded-2xl border border-slate-200/60 dark:border-white/[0.06]">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/[0.06] flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-red-500 dark:text-red-400 text-sm font-medium mb-1">Failed to load internship roles</p>
            <p className="text-slate-400 dark:text-white/30 text-xs">{error}</p>
          </motion.div>
        )}

        {/* ── Cards Grid ── */}
        {!loading && !error && (
          <>
            {filteredCards.length === 0 && rawCards.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white dark:bg-[#111111] rounded-2xl border border-slate-200/60 dark:border-white/[0.06]">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-white/[0.05]">
                  <Filter className="w-6 h-6 text-slate-300 dark:text-white/20" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">No programs match your filters</h3>
                <p className="text-[13px] text-slate-400 dark:text-white/30 mb-5">Try adjusting your search or filters</p>
                <button onClick={clearAllFilters} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black text-[12px] font-bold hover:shadow-lg transition-all">
                  <RefreshCw className="w-3.5 h-3.5" /> Reset filters
                </button>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                {filteredCards.map((card, i) => {
                  const IconComp = iconMap[card.icon] || Briefcase;
                  const tier = getTierLabel(card.duration);
                  const isThisEnrolling = enrollingId === card.key;
                  const enrollment = card.enrollment;
                  const isEnrolled = !!enrollment;
                  const isCompleted = enrollment?.status === 'COMPLETED';
                  const percent = enrollment?.completion?.percent ?? 0;
                  const randomSkills = getRandom4(card.skills, card.key);

                  return (
                    <motion.div
                      key={card.key}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 ${
                        isEnrolled
                          ? isCompleted
                            ? 'bg-white dark:bg-[#111111] border-emerald-200/50 dark:border-emerald-500/20'
                            : 'bg-white dark:bg-[#111111] border-primary-200/50 dark:border-primary-500/15'
                          : 'bg-white dark:bg-[#111111] border-slate-200/60 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1]'
                      }`}
                    >
                      {/* Tier ribbon */}
                      <div className={`relative px-5 pt-5 pb-0`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm" style={{ backgroundColor: `${card.color}10`, border: `1px solid ${card.color}25` }}>
                            <IconComp className="w-6 h-6" style={{ color: card.color }} />
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${tier.bg} ${tier.text} ${tier.border}`}>
                              {tier.label}
                            </span>
                            {isEnrolled ? (
                              isCompleted ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200/50 dark:border-emerald-500/15">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Completed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-500/[0.06] text-primary-600 dark:text-primary-400 text-[10px] font-bold border border-primary-200/50 dark:border-primary-500/15">
                                  <Clock className="w-2.5 h-2.5" /> In Progress
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200/50 dark:border-emerald-500/15">
                                <Zap className="w-2.5 h-2.5" /> Open
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug mb-1">{card.roleName}</h3>

                        {/* Duration + Certificate row */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${tier.bg} ${tier.text} ${tier.border}`}>
                            <CalendarDays className="w-3 h-3" /> {card.durationLabel}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${tier.bg} ${tier.text} ${tier.border}`}>
                            <Award className="w-3 h-3" /> {tier.desc}
                          </span>
                        </div>
                      </div>

                      <div className="px-5 pb-5 flex flex-col flex-1">
                        {/* Description */}
                        <p className="text-[12px] text-slate-500 dark:text-white/40 leading-relaxed mb-3.5 line-clamp-2">{card.description}</p>

                        {/* Skills (random 4) */}
                        {randomSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3.5">
                            {randomSkills.map((skill, j) => (
                              <span key={j} className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-slate-50 dark:bg-white/[0.04] text-slate-600 dark:text-white/50 border border-slate-100 dark:border-white/[0.05]">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-white/25 mb-4 pb-4 border-b border-slate-100 dark:border-white/[0.04]">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {card.taskCount} Tasks</span>
                          <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Verified Cert</span>
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Offer Letter</span>
                        </div>

                        {/* Progress Bar (enrolled only) */}
                        {isEnrolled && enrollment.completion && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-wider">Progress</span>
                              <span className={`text-[10px] font-extrabold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary-600 dark:text-primary-400'}`}>{percent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-white/[0.04] rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-primary-500 to-secondary-500'}`}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex-1" />

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          {!isAuthenticated ? (
                            <button
                              onClick={() => navigate('/login')}
                              className="w-full py-2.5 rounded-xl text-[12px] font-bold bg-white dark:bg-white/[0.03] text-slate-700 dark:text-white/60 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1] transition-all flex items-center justify-center gap-2"
                            >
                              Login to Enroll <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : meStatus === false ? (
                            <button
                              onClick={() => navigate('/login')}
                              className="w-full py-2.5 rounded-xl text-[12px] font-bold bg-white dark:bg-white/[0.03] text-slate-700 dark:text-white/60 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1] transition-all flex items-center justify-center gap-2"
                            >
                              Get Internship <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : isEnrolled ? (
                            <>
                              <button
                                onClick={() => navigate(`/internships/${card.roleId}/${card.duration}`)}
                                className="w-full py-2.5 rounded-xl text-[12px] font-bold bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-sm shadow-primary-500/15 hover:shadow-md hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Tasks
                              </button>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => { if (!enrollment.certificate) { toast.info('Complete all tasks for certificate.'); return; } navigate('/certificates-list'); }}
                                  disabled={!enrollment.certificate}
                                  className="py-2 px-2 rounded-xl text-[11px] font-bold bg-amber-50 dark:bg-amber-500/[0.06] text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Award className="w-3 h-3" /> Certificate
                                </button>
                                <button
                                  onClick={() => { if (!enrollment.offerLetter) { toast.info('Offer letter not yet available.'); return; } navigate('/offer-letters'); }}
                                  disabled={!enrollment.offerLetter}
                                  className="py-2 px-2 rounded-xl text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <FileText className="w-3 h-3" /> Offer
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEnrollClick(card)}
                              disabled={isThisEnrolling}
                              className="w-full py-2.5 rounded-xl text-[12px] font-bold bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-sm shadow-primary-500/15 hover:shadow-md hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {isThisEnrolling ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enrolling...</>
                              ) : (
                                <>Enroll Now <ArrowRight className="w-3.5 h-3.5" /></>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Results count */}
            {rawCards.length > 0 && (
              <div className="text-center pb-8">
                <span className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-400 dark:text-white/25">
                  Showing {filteredCards.length} of {rawCards.length} programs
                  {activeFiltersCount > 0 && <>&middot; {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied</>}
                </span>
              </div>
            )}
          </>
        )}

        {/* ── Empty (no cards at all) ── */}
        {!loading && !error && rawCards.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white dark:bg-[#111111] rounded-2xl border border-slate-200/60 dark:border-white/[0.06]">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-300 dark:text-white/15" />
            </div>
            <p className="text-slate-500 dark:text-white/30 text-sm font-medium">No internship programs available at the moment.</p>
          </motion.div>
        )}
      </div>

      {/* ── Confirmation Modal ── */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-[#111111] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden"
            >
              <div className="h-1 w-full bg-gradient-to-r from-primary-500 to-secondary-500" />

              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center border border-primary-100 dark:border-primary-500/15">
                      <Sparkles className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                    </div>
                    <h3 className="text-[17px] font-extrabold text-slate-900 dark:text-white">Confirm Enrollment</h3>
                  </div>
                  <button onClick={() => setConfirmModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
                    <X className="w-4 h-4 text-slate-400 dark:text-white/40" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04] mb-5">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">{confirmModal.roleName}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-white/40 mt-2">
                    <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {confirmModal.durationLabel}</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {confirmModal.taskCount} Tasks</span>
                    <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Verified Certificate</span>
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Offer Letter</span>
                  </div>
                </div>

                <p className="text-[13px] text-slate-600 dark:text-white/50 mb-6 leading-relaxed">
                  You are about to enroll in this internship. Once enrolled, you'll have access to all tasks and your offer letter will be generated.
                </p>

                <div className="flex gap-3">
                  <button onClick={() => setConfirmModal(null)}
                    className="flex-1 py-2.5 rounded-xl text-[12px] font-bold bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all">
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmEnroll}
                    className="flex-1 py-2.5 rounded-xl text-[12px] font-bold bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-sm shadow-primary-500/15 hover:shadow-md hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Confirm Enroll
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSelect({ label, icon, value, onChange, options }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 dark:text-white/25 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1.5">
        {icon}{label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-slate-800 dark:text-white text-[12px] font-medium focus:outline-none focus:border-primary-500/30 focus:ring-2 focus:ring-primary-500/10 transition-all cursor-pointer appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 3l3 3 3-3' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px' }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}