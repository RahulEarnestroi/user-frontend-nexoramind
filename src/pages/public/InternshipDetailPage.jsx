import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, ArrowLeft, Loader2, AlertCircle, CheckCircle2,
  Clock, ExternalLink, Send, X, FileText, Award, Users,
  Target, Code, GitBranch, ChevronDown, ChevronUp,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { api, extractList } from '../../services/api';

const durationLabel = {
  '1month': '1 Month',
  '2month': '2 Months',
  '3month': '3 Months',
  '6month': '6 Months',
};

const difficultyConfig = {
  Easy: { label: 'Easy', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
  Medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20' },
  Hard: { label: 'Hard', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/20' },
};

const statusConfig = {
  NOT_SUBMITTED: { label: 'Not Submitted', color: 'text-slate-500 dark:text-white/40', bg: 'bg-slate-100 dark:bg-white/[0.06]', border: 'border-slate-200 dark:border-white/[0.06]', icon: null },
  PENDING: { label: 'Pending Review', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', icon: Clock },
  REVIEWING: { label: 'Reviewing', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', icon: Clock },
  APPROVED: { label: 'Approved', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2 },
};

function normalizeTask(t) {
  const rawStatus = t.ReviewStatus ?? t.review_status ?? t.Status ?? t.status;
  let reviewStatus = 'NOT_SUBMITTED';
  if (rawStatus && typeof rawStatus === 'string') {
    reviewStatus = rawStatus.toUpperCase();
  } else if (rawStatus === true) {
    reviewStatus = 'APPROVED';
  }

  return {
    roleId: t.RoleID ?? t.role_id ?? '',
    roleName: t.RoleName ?? t.role_name ?? '',
    duration: t.Duration ?? t.duration ?? '',
    taskNumber: t.TaskNumber ?? t.task_number ?? 1,
    title: t.Title ?? t.title ?? t.TaskName ?? t.task_name ?? '',
    difficulty: t.Difficulty ?? t.difficulty ?? 'Medium',
    estimatedEffort: t.EstimatedEffort ?? t.estimated_effort ?? '',
    objective: t.Objective ?? t.objective ?? t.Description ?? t.description ?? '',
    requirements: t.Requirements ?? t.requirements ?? [],
    techStack: t.TechStack ?? t.tech_stack ?? t.TechStack ?? [],
    submissionGuidelines: t.SubmissionGuidelines ?? t.submission_guidelines ?? [],
    reviewStatus,
    githubLink: t.GitHubLink ?? t.github_link ?? t.githubLink ?? '',
  };
}

function TaskCard({ task, onSubmit }) {
  const [expanded, setExpanded] = useState(false);
  const st = statusConfig[task.reviewStatus] || statusConfig.NOT_SUBMITTED;
  const dc = difficultyConfig[task.difficulty] || difficultyConfig.Medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 overflow-hidden"
    >
      {/* Header - always visible */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/15 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
              {task.taskNumber}
            </span>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{task.title}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${dc.bg} ${dc.color} ${dc.border}`}>
                  {dc.label}
                </span>
                {task.estimatedEffort && (
                  <span className="text-[11px] text-slate-400 dark:text-white/30">{task.estimatedEffort}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.bg} ${st.color} ${st.border}`}>
              {st.icon && <st.icon className="w-3 h-3" />}
              {st.label}
            </span>
          </div>
        </div>

        {/* Action buttons - always visible */}
        <div className="flex items-center gap-2 mt-3">
          {/* {(task.reviewStatus === 'NOT_SUBMITTED' || !task.reviewStatus) && ( */}
            <button
              onClick={(e) => { e.stopPropagation(); onSubmit(task.taskNumber); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-semibold hover:opacity-90 transition-all"
            >
              <Send className="w-3.5 h-3.5" /> Submit Task
            </button>
          {/* )} */}
          {task.githubLink && (
            <a href={task.githubLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-primary-600 dark:text-primary-400 hover:underline">
              <ExternalLink className="w-3 h-3" /> GitHub
            </a>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-all ml-auto"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-200/50 dark:border-white/[0.04] pt-4">
              {/* Objective */}
              {task.objective && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Objective</h5>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-white/50 leading-relaxed font-normal">{task.objective}</p>
                </div>
              )}

              {/* Requirements */}
              {task.requirements.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Requirements</h5>
                  </div>
                  <div className="space-y-3">
                    {task.requirements.map((req, i) => (
                      <div key={i}>
                        <p className="text-sm font-semibold text-slate-700 dark:text-white/70 mb-1">{req.Section}</p>
                        <ul className="space-y-1 ml-1">
                          {(req.Items || []).map((item, j) => (
                            <li key={j} className="text-sm text-slate-600 dark:text-white/50 font-normal flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-white/30 mt-2 shrink-0" />
                              <span className="font-mono text-xs">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              {task.techStack.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Tech Stack</h5>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {task.techStack.map((tech, i) => (
                      <span key={i} className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/50 border border-slate-200 dark:border-white/[0.06] font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Guidelines */}
              {task.submissionGuidelines.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Submission Guidelines</h5>
                  </div>
                  <ul className="space-y-1.5 ml-1">
                    {task.submissionGuidelines.map((g, i) => (
                      <li key={i} className="text-sm text-slate-600 dark:text-white/50 font-normal flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function InternshipDetailPage() {
  const { roleId, duration } = useParams();
  const { isAuthenticated } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);
  const [notEnrolled, setNotEnrolled] = useState(false);

  const [submitModal, setSubmitModal] = useState(null);
  const [githubLink, setGithubLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Progress from submit-task response
  const [approvedCount, setApprovedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotEnrolled(false);
    try {
      const data = await api.getTasks(roleId, duration);
      const raw = extractList(data, 'tasks', 'data', 'result');
      const normalized = raw.map(normalizeTask);
      setTasks(normalized);
      // Count from task review statuses
      const approved = normalized.filter(t => t.reviewStatus === 'APPROVED').length;
      setApprovedCount(approved);
      setTotalCount(normalized.length);
    } catch (err) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('not enrolled') || msg.includes('no enrollment') || msg.includes('not found') || msg.includes('400') || msg.includes('404')) {
        setNotEnrolled(true);
      } else {
        setError(err.message || 'Failed to load tasks');
      }
    } finally {
      setLoading(false);
    }
  }, [roleId, duration]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      setLoading(false);
      setError('Please log in to view internship tasks.');
    }
  }, [isAuthenticated, fetchTasks]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.enroll(roleId, duration);
      toast.success('Enrolled successfully!');
      setNotEnrolled(false);
      await fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleSubmitTask = async () => {
    if (!githubLink.trim()) { toast.warning('Please enter a GitHub link'); return; }
    setSubmitting(true);
    try {
      const data = await api.submitTask(githubLink.trim(), roleId, duration, submitModal);
      toast.success('Task submitted successfully!');
      // Use server-side counts if available
      if (data.approved !== undefined) setApprovedCount(data.approved);
      if (data.total !== undefined) setTotalCount(data.total);
      setSubmitModal(null);
      setGithubLink('');
      await fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Task submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const allApproved = totalCount > 0 && approvedCount === totalCount;

  return (
    <div className="py-16 bg-white dark:bg-black min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/internships" className="inline-flex items-center mt-10 gap-1 text-sm text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to internships
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{roleId}</h1>
          <p className="text-slate-500 dark:text-white/40 mt-2">Duration: {durationLabel[duration] || duration}</p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-white/40 text-sm">Loading tasks...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && !notEnrolled && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
            <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
            {!isAuthenticated && (
              <Link to="/login" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all">Log In</Link>
            )}
          </div>
        )}

        {/* Not Enrolled */}
        {!loading  && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-8 rounded-2xl bg-primary-50 dark:bg-primary-500/5 border border-primary-200 dark:border-primary-500/15 text-center">
              <Users className="w-10 h-10 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Not Enrolled Yet</h3>
              <p className="text-slate-500 dark:text-white/40 mb-6 max-w-sm mx-auto font-normal">
                You haven't enrolled in this internship yet. Enroll now to get assigned tasks and start working.
              </p>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Tasks */}
        {!loading && !error && !notEnrolled && tasks.length > 0 && (
          <>
            {/* Progress */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-white/70">Progress</span>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{approvedCount}/{totalCount} Tasks</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${totalCount > 0 ? (approvedCount / totalCount) * 100 : 0}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* All Approved Banner */}
            {allApproved && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">All Tasks Approved!</h3>
                </div>
                <p className="text-emerald-700 dark:text-emerald-400/70 text-sm mb-4 font-normal">
                  Congratulations! You've completed all tasks. You can now view your certificate and offer letter.
                </p>
                <div className="flex gap-3">
                  <Link to="/certificates-list" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all">
                    <Award className="w-4 h-4" /> View Certificate
                  </Link>
                  <Link to="/offer-letters" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.06] border border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all">
                    <FileText className="w-4 h-4" /> View Offer Letter
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Task List */}
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard key={task.taskNumber} task={task} onSubmit={(num) => setSubmitModal(num)} />
              ))}
            </div>
          </>
        )}

        {/* Empty tasks */}
        {!loading && !error && !notEnrolled && tasks.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-slate-400 dark:text-white/30 text-sm">No tasks found for this role.</p>
          </div>
        )}

        {/* Submit Modal */}
        <AnimatePresence>
          {submitModal !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
              onClick={() => { setSubmitModal(null); setGithubLink(''); }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-primary-950 border border-slate-200 dark:border-white/[0.1] shadow-xl"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Task #{submitModal}</h3>
                  <button onClick={() => { setSubmitModal(null); setGithubLink(''); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white/60 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <label className="block text-sm font-medium text-slate-700 dark:text-white/70 mb-2">GitHub Repository Link</label>
                <input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={githubLink}
                  onChange={e => setGithubLink(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all mb-5"
                  onKeyDown={e => e.key === 'Enter' && handleSubmitTask()}
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => { setSubmitModal(null); setGithubLink(''); }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-white/70 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitTask}
                    disabled={submitting || !githubLink.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
