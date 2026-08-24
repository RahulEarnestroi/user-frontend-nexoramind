import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Server, Layout, Brain, Database,
  Loader2, AlertCircle, CheckCircle2, Clock
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    api.getRoles()
      .then(data => {
        const raw = extractList(data, 'roles', 'data', 'result');
        setRoles(raw.map(normalizeRole).filter(r => r.status.toUpperCase() === 'ACTIVE'));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Build flat list: each card = one role + one duration
  const cards = [];
  roles.forEach(role => {
    role.durations.forEach(d => {
      cards.push({
        key: `${role.roleId}-${d.duration}`,
        roleId: role.roleId,
        roleName: role.name,
        duration: d.duration,
        durationLabel: d.label || formatDuration(d.duration),
        taskCount: d.taskCount,
        description: role.description,
        skills: role.skills,
        icon: role.icon,
        color: role.color,
      });
    });
  });

  const handleEnroll = async (card) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (meStatus === false) { navigate('/login'); return; }

    setEnrollingId(card.key);
    try {
      await api.enroll(card.roleId, card.duration);
      toast.success(`Enrolled in ${card.roleName} (${card.durationLabel})!`);
      navigate(`/internships/${card.roleId}/${card.duration}`);
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('already enrolled')) {
        toast.info(`Already enrolled in ${card.roleName}. Loading tasks...`);
        navigate(`/internships/${card.roleId}/${card.duration}`);
      } else {
        toast.error(err.message || 'Enrollment failed');
      }
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="py-20 bg-white dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Cards Grid - 3 columns */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {cards.map((card, i) => {
              const IconComp = iconMap[card.icon] || Briefcase;
              const isThisEnrolling = enrollingId === card.key;

              return (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 flex flex-col"
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
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                      Active
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed mb-3 font-normal line-clamp-2">{card.description}</p>

                  {/* Skills */}
                  {card.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
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
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-white/30 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {card.durationLabel}</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {card.taskCount} tasks</span>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    {!isAuthenticated ? (
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all"
                      >
                        Login to Enroll
                      </button>
                    ) : meStatus === false ? (
                      <button
                        onClick={() => navigate('/login')}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all"
                      >
                        Get Internship
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(card)}
                        disabled={isThisEnrolling}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isThisEnrolling ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Enrolling...</>
                        ) : (
                          'Enroll Now'
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
    </div>
  );
}
