import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Server, Layout, Brain, Database,
  Loader2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { api, extractList } from '../../services/api';

const iconMap = {
  server: Server,
  layout: Layout,
  brain: Brain,
  database: Database,
};

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
      label: d.Label ?? d.label ?? d.Duration ?? d.duration ?? '',
    })),
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

  useEffect(() => {
    api.getRoles()
      .then(data => {
        const raw = extractList(data, 'roles', 'data', 'result');
        setRoles(raw.map(normalizeRole).filter(r => r.status.toUpperCase() === 'ACTIVE'));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

        {/* Role Cards */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {roles.map((role, i) => {
              const IconComp = iconMap[role.icon] || Briefcase;
              return (
                <motion.div
                  key={role.roleId || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${role.color}15`, border: `1px solid ${role.color}25` }}
                    >
                      <IconComp className="w-5 h-5" style={{ color: role.color }} />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                      Active
                    </span>
                  </div>

                  {/* Name & Description */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{role.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-white/40 leading-relaxed mb-4 font-normal">{role.description}</p>

                  {/* Skills */}
                  {role.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {role.skills.slice(0, 5).map((skill, j) => (
                        <span key={j} className="px-2 py-0.5 text-[11px] rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/[0.06] font-medium">
                          {skill}
                        </span>
                      ))}
                      {role.skills.length > 5 && (
                        <span className="px-2 py-0.5 text-[11px] rounded-md text-slate-400 dark:text-white/30 font-medium">
                          +{role.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Duration Options */}
                  <div className="mt-auto">
                    <p className="text-xs font-medium text-slate-400 dark:text-white/30 mb-2 uppercase tracking-wider">Choose Duration</p>
                    <div className="grid grid-cols-3 gap-2">
                      {role.durations.map((d) => {
                        const handleClick = () => {
                          if (!isAuthenticated) { navigate('/login'); return; }
                          if (meStatus === false) { navigate('/login'); return; }
                          navigate(`/internships/${role.roleId}/${d.duration}`);
                        };
                        return (
                          <button
                            key={d.duration}
                            onClick={handleClick}
                            className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-200 dark:hover:border-primary-500/20 hover:text-primary-600 dark:hover:text-primary-400 text-slate-600 dark:text-white/50 transition-all group"
                          >
                            <span className="text-sm font-semibold">{d.label || d.duration}</span>
                            <span className="text-[10px] text-slate-400 dark:text-white/30 group-hover:text-primary-500 dark:group-hover:text-primary-400">{d.taskCount} tasks</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && roles.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-slate-400 dark:text-white/30 text-sm">No internship roles available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
