import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Server, Layout, Brain, Database,
  Loader2, AlertCircle, CheckCircle2, Clock,
  Eye, Award, FileText, ArrowRight, X,
  Sparkles, Zap, Users, Trophy
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { api, extractList } from '../../services/api';

const iconMap = {
  server: Server,
  layout: Layout,
  brain: Brain,
  database: Database,
};

function formatDuration(raw) {
  if (!raw) return '';
  if (/\s/.test(raw) && /[A-Z]/.test(raw)) return raw;
  const m = raw.match(/^(\d+)\s*(month|months|mo)$/i);
  if (m) { const n = parseInt(m[1], 10); return `${n} ${n === 1 ? 'Month' : 'Months'}`; }
  return raw;
}

function normalizeRole(r) {
  return {
    roleId: r.RoleID ?? r.role_id ?? '',
    name: r.Name ?? r.name ?? r.role_name ?? '',
    description: r.Description ?? r.description ?? '',
    icon: r.Icon ?? r.icon ?? 'briefcase',
    color: r.Color ?? r.color ?? '#6366f1',
    skills: r.Skills ?? r.skills ?? [],
    durations: (r.Durations ?? r.durations ?? []).map(d => {
      const rawDuration = d.Duration ?? d.duration ?? '';
      const rawLabel = d.Label ?? d.label ?? '';
      return {
        duration: rawDuration,
        taskCount: d.TaskCount ?? d.task_count ?? 0,
        label: rawLabel || formatDuration(rawDuration),
      };
    }),
    status: r.Status ?? r.status ?? 'ACTIVE',
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rolesData] = await Promise.all([
          api.getRoles(),
          isAuthenticated ? api.listInternships().catch(() => []) : Promise.resolve([]),
        ]);
        const rawRoles = extractList(rolesData, 'roles', 'data', 'result');
        setRoles(rawRoles.map(normalizeRole).filter(r => r.status.toUpperCase() === 'ACTIVE'));

        if (isAuthenticated) {
          try {
            const enrollData = await api.listInternships();
            const rawEnroll = extractList(enrollData, 'internships', 'data', 'result');
            setEnrollments(rawEnroll);
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
      roleId: rid,
      roleName: e.RoleName ?? e.role_name ?? rid,
      duration: dur,
      durationDisplay: e.DurationDisplay ?? e.duration_display ?? formatDuration(dur),
      status: e.Status ?? e.status ?? 'IN_PROGRESS',
      totalTasks: e.TotalTasks ?? e.total_tasks ?? 0,
      allTasksCompleted: e.AllTasksCompleted ?? e.all_tasks_completed ?? false,
      certificationGenerated: e.CertificationGenerated ?? e.certification_generated ?? false,
      enrolledAt: e.EnrolledAt ?? e.enrolled_at ?? '',
      completion: e.Completion ?? {},
      offerLetter: e.OfferLetter ?? null,
      certificate: e.Certificate ?? null,
    };
  });

  const cards = [];
  roles.forEach(role => {
    role.durations.forEach(d => {
      const key = `${role.roleId}-${d.duration}`;
      cards.push({
        key,
        roleId: role.roleId,
        roleName: role.name,
        duration: d.duration,
        durationLabel: d.label || formatDuration(d.duration),
        taskCount: d.taskCount,
        description: role.description,
        skills: role.skills,
        icon: role.icon,
        color: role.color,
        enrollment: enrollmentMap[key] || null,
      });
    });
  });

  const totalEnrolled = cards.filter(c => c.enrollment).length;
  const totalCompleted = cards.filter(c => c.enrollment?.status === 'COMPLETED').length;

  const handleEnrollClick = (card) => {
    setConfirmModal({
      roleId: card.roleId,
      roleName: card.roleName,
      duration: card.duration,
      durationLabel: card.durationLabel,
      taskCount: card.taskCount,
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
      const rawEnroll = extractList(enrollData, 'internships', 'data', 'result');
      setEnrollments(rawEnroll);
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('already enrolled')) {
        toast.info(`Already enrolled in ${roleName}. Refreshing...`);
        const enrollData = await api.listInternships();
        const rawEnroll = extractList(enrollData, 'internships', 'data', 'result');
        setEnrollments(rawEnroll);
      } else {
        toast.error(err.message || 'Enrollment failed');
      }
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-black dark:via-slate-950 dark:to-black">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/[0.06] rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/[0.04] rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.12] backdrop-blur-sm text-white/80 text-xs font-semibold mb-5 border border-white/[0.15]">
              <Briefcase className="w-3.5 h-3.5" /> Career Opportunities
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">Internship Programs</h1>
            <p className="text-white/50 max-w-xl mx-auto text-base font-normal">Launch your tech career with hands-on internship positions at NexoraMind Tech.</p>

            {/* Stats Row */}
            {!loading && cards.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-4 sm:gap-6 mt-8 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.1] backdrop-blur-sm border border-white/[0.1]">
                  <Briefcase className="w-4 h-4 text-white/60" />
                  <span className="text-sm font-bold text-white">{cards.length}</span>
                  <span className="text-xs text-white/40">Programs</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.1] backdrop-blur-sm border border-white/[0.1]">
                  <Users className="w-4 h-4 text-white/60" />
                  <span className="text-sm font-bold text-white">{totalEnrolled}</span>
                  <span className="text-xs text-white/40">Enrolled</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.1] backdrop-blur-sm border border-white/[0.1]">
                  <Trophy className="w-4 h-4 text-emerald-300" />
                  <span className="text-sm font-bold text-emerald-300">{totalCompleted}</span>
                  <span className="text-xs text-white/40">Completed</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-10">

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-white dark:bg-white/[0.02] rounded-2xl border border-red-200 dark:border-red-500/20">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/[0.06] flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-red-500 dark:text-red-400 text-sm font-medium mb-1">Failed to load internship roles</p>
            <p className="text-slate-400 dark:text-white/30 text-xs">{error}</p>
          </motion.div>
        )}

        {/* ── Cards Grid ── */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3  gap-5 pb-12">
            {cards.map((card, i) => {
              const IconComp = iconMap[card.icon] || Briefcase;
              const isThisEnrolling = enrollingId === card.key;
              const enrollment = card.enrollment;
              const isEnrolled = !!enrollment;
              const isCompleted = enrollment?.status === 'COMPLETED';
              const percent = enrollment?.completion?.percent ?? 0;

              return (
                <motion.div
                  key={card.key}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 ${
                    isEnrolled
                      ? isCompleted
                        ? 'bg-white dark:bg-white/[0.02] border-emerald-200 dark:border-emerald-500/20 shadow-sm hover:shadow-lg hover:shadow-emerald-500/5'
                        : 'bg-white dark:bg-white/[0.02] border-primary-200 dark:border-primary-500/15 shadow-sm hover:shadow-lg hover:shadow-primary-500/5'
                      : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] shadow-sm hover:shadow-lg hover:shadow-primary-500/5'
                  }`}
                >
                  {/* Top accent */}
                  <div className={`h-1 w-full transition-opacity duration-300 ${
                    isCompleted ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                    isEnrolled ? 'bg-gradient-to-r from-primary-500 to-secondary-500' :
                    'bg-gradient-to-r from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-100'
                  }`} />

                  <div className="p-5 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform" style={{ backgroundColor: `${card.color}10`, border: `1px solid ${card.color}20` }}>
                          <IconComp className="w-5 h-5" style={{ color: card.color }} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{card.roleName}</h3>
                          <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">{card.durationLabel}</span>
                        </div>
                      </div>
                      {isEnrolled ? (
                        isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-500/15">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-500/[0.06] text-primary-600 dark:text-primary-400 text-[10px] font-bold border border-primary-200/60 dark:border-primary-500/15">
                            <Clock className="w-3 h-3" /> Active
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-500/15">
                          <Zap className="w-3 h-3" /> Open
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed mb-3 line-clamp-2">{card.description}</p>

                    {/* Skills */}
                    {card.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {card.skills.slice(0, 3).map((skill, j) => (
                          <span key={j} className="px-2 py-0.5 text-[10px] rounded-lg bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-white/50 border border-slate-200/60 dark:border-white/[0.06] font-medium">
                            {skill}
                          </span>
                        ))}
                        {card.skills.length > 3 && (
                          <span className="px-2 py-0.5 text-[10px] rounded-lg text-slate-400 dark:text-white/25 font-medium">+{card.skills.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-white/30 mb-3 pb-3 border-b border-slate-100 dark:border-white/[0.04]">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {card.durationLabel}</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {card.taskCount} tasks</span>
                    </div>

                    {/* Progress Bar (enrolled only) */}
                    {isEnrolled && enrollment.completion && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">Progress</span>
                          <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary-600 dark:text-primary-400'}`}>{percent}%</span>
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

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {!isAuthenticated ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate('/login')}
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1] transition-all flex items-center justify-center gap-2"
                        >
                          Login to Enroll <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                      ) : meStatus === false ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate('/login')}
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1] transition-all flex items-center justify-center gap-2"
                        >
                          Get Internship <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                      ) : isEnrolled ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/internships/${card.roleId}/${card.duration}`)}
                            className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-sm shadow-primary-500/15 hover:shadow-md hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Tasks
                          </motion.button>
                          <div className="grid grid-cols-2 gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (!enrollment.certificate) { toast.info('Certificate not yet available. Complete all tasks first.'); return; }
                                navigate('/certificates-list');
                              }}
                              disabled={!enrollment.certificate}
                              className="py-2 px-3 rounded-xl text-[11px] font-bold bg-amber-50 dark:bg-amber-500/[0.06] text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Award className="w-3 h-3" /> Certificate
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                if (!enrollment.offerLetter) { toast.info('Offer letter not available.'); return; }
                                navigate('/offer-letters');
                              }}
                              disabled={!enrollment.offerLetter}
                              className="py-2 px-3 rounded-xl text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <FileText className="w-3 h-3" /> Offer Letter
                            </motion.button>
                          </div>
                        </>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleEnrollClick(card)}
                          disabled={isThisEnrolling}
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-sm shadow-primary-500/15 hover:shadow-md hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isThisEnrolling ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enrolling...</>
                          ) : (
                            <>Enroll Now <ArrowRight className="w-3.5 h-3.5" /></>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && cards.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06]">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
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
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden"
            >
              {/* Gradient top */}
              <div className="h-1 w-full bg-gradient-to-r from-primary-500 to-secondary-500" />

              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center border border-primary-100 dark:border-primary-500/15">
                      <Sparkles className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Enrollment</h3>
                  </div>
                  <button onClick={() => setConfirmModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
                    <X className="w-4 h-4 text-slate-400 dark:text-white/40" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04] mb-5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{confirmModal.roleName}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-white/40">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {confirmModal.durationLabel}</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {confirmModal.taskCount} tasks</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-white/50 mb-6 leading-relaxed">
                  You are about to enroll in this internship program. Once enrolled, you'll receive tasks to complete and an offer letter will be generated.
                </p>

                <div className="flex gap-3">
                  <button onClick={() => setConfirmModal(null)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-white/[0.03] text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all">
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmEnroll}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-sm shadow-primary-500/15 hover:shadow-md hover:shadow-primary-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Confirm Enroll
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}