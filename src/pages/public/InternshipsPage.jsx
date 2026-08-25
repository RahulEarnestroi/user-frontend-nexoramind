import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Server, Layout, Brain, Database,
  Loader2, AlertCircle, CheckCircle2, Clock,
  Eye, Award, FileText, ArrowRight, X,
  Sparkles
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
  if (m) {
    const n = parseInt(m[1], 10);
    return `${n} ${n === 1 ? 'Month' : 'Months'}`;
  }
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

  // Map enrollments by key "roleId-duration"
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

  // Build flat list: each card = one role + one duration
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

  // ─── Confirm Modal ───
  const handleEnrollClick = (card) => {
    setConfirmModal({
      roleId: card.roleId,
      roleName: card.roleName,
      duration: card.duration,
      durationLabel: card.durationLabel,
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
      // Re-fetch enrollments
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
    <div className="py-20 bg-white dark:bg-black min-h-screen">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
            <Briefcase className="w-3 h-3" /> Internships
          </span>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Internship Opportunities</h1>
          <p className="mt-4 text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg font-normal">
            Launch your tech career with hands-on internship positions at NexoraMind Tech.
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-white/40 text-sm">Loading roles...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
            <p className="text-red-500 dark:text-red-400 text-sm mb-2">Failed to load internship roles</p>
            <p className="text-slate-400 dark:text-white/30 text-xs">{error}</p>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {cards.map((card, i) => {
              const IconComp = iconMap[card.icon] || Briefcase;
              const isThisEnrolling = enrollingId === card.key;
              const enrollment = card.enrollment;
              const isEnrolled = !!enrollment;
              const isCompleted = enrollment?.status === 'COMPLETED';

              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col ${
                    isEnrolled
                      ? isCompleted
                        ? 'bg-green-50/50 dark:bg-green-500/[0.03] border-green-200 dark:border-green-500/20 hover:border-green-300 dark:hover:border-green-500/30'
                        : 'bg-primary-50/30 dark:bg-primary-500/[0.03] border-primary-200 dark:border-primary-500/15 hover:border-primary-300 dark:hover:border-primary-500/25'
                      : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-white/[0.1]'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${card.color}15`, border: `1px solid ${card.color}25` }}
                      >
                        <IconComp className="w-5 h-5" style={{ color: card.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{card.roleName}</h3>
                        <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">{card.durationLabel}</span>
                      </div>
                    </div>
                    {isEnrolled ? (
                      isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold border border-green-500/20 uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-bold border border-primary-500/20 uppercase tracking-wider">
                          <Clock className="w-3 h-3" /> In Progress
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed mb-3 font-normal line-clamp-2">{card.description}</p>

                  {/* Skills */}
                  {card.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {card.skills.slice(0, 3).map((skill, j) => (
                        <span key={j} className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/[0.06] font-medium">
                          {skill}
                        </span>
                      ))}
                      {card.skills.length > 3 && (
                        <span className="px-2 py-0.5 text-[10px] rounded-md text-slate-400 dark:text-white/30 font-medium">
                          +{card.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-white/30 mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {card.durationLabel}</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {card.taskCount} tasks</span>
                  </div>

                  {/* Progress Bar (enrolled only) */}
                  {isEnrolled && enrollment.completion && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-white/40 uppercase tracking-wider">Progress</span>
                        <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400">{enrollment.completion.percent ?? 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${enrollment.completion.percent ?? 0}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-primary-500 to-secondary-500'}`}
                        />
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 dark:text-white/30">
                        <span>{enrollment.completion.approved ?? 0}/{enrollment.completion.total ?? 0} approved</span>
                        {enrollment.completion.submitted > 0 && <span>{enrollment.completion.submitted} submitted</span>}
                        {enrollment.completion.pending > 0 && <span>{enrollment.completion.pending} pending</span>}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-auto space-y-2">
                    {!isAuthenticated ? (
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all flex items-center justify-center gap-2"
                      >
                        Login to Enroll
                      </button>
                    ) : meStatus === false ? (
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all flex items-center justify-center gap-2"
                      >
                        Get Internship
                      </button>
                    ) : isEnrolled ? (
                      <>
                        {/* View Tasks */}
                        <button
                          onClick={() => navigate(`/internships/${card.roleId}/${card.duration}`)}
                          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" /> View Tasks
                        </button>
                        {/* Certificate & Offer Letter */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              if (!enrollment.certificate) { toast.info('Certificate not yet available. Complete all tasks first.'); return; }
                              navigate('/certificates-list');
                            }}
                            disabled={!enrollment.certificate}
                            className="py-2 px-3 rounded-xl text-[11px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/15 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Award className="w-3.5 h-3.5" /> Certificate
                          </button>
                          <button
                            onClick={() => {
                              if (!enrollment.offerLetter) { toast.info('Offer letter not available.'); return; }
                              navigate('/offer-letters');
                            }}
                            disabled={!enrollment.offerLetter}
                            className="py-2 px-3 rounded-xl text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/15 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <FileText className="w-3.5 h-3.5" /> Offer Letter
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEnrollClick(card)}
                        disabled={isThisEnrolling}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isThisEnrolling ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling...</>
                        ) : (
                          <>Enroll Now <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && cards.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-slate-400 dark:text-white/30 text-sm">No internship roles available at the moment.</p>
          </div>
        )}
      </div>

      {/* ── Confirmation Modal ── */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between mb-4">
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
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] mb-5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{confirmModal.roleName}</p>
                  <p className="text-xs text-slate-500 dark:text-white/40">Duration: {confirmModal.durationLabel}</p>
                </div>

                <p className="text-sm text-slate-600 dark:text-white/50 mb-6 leading-relaxed">
                  You are about to enroll in this internship program. Once enrolled, you'll receive tasks to complete and an offer letter will be generated.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmEnroll}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
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
