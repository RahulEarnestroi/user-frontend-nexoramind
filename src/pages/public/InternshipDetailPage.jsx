import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, ArrowLeft, Loader2, AlertCircle, CheckCircle2,
  Clock, Send, X, FileText, Award,
  ChevronDown,
  ChevronLeft, ChevronRight, Rocket, GitPullRequest,
  Eye, Hourglass, CircleDot, Lock,
  Zap, Target, Layers, Code2, BookOpen,
  Sparkles, Star, Trophy
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { api, extractList } from '../../services/api';

/* ── Helpers ── */
function formatDuration(raw) {
  if (!raw) return '';
  if (/\s/.test(raw) && /[A-Z]/.test(raw)) return raw;
  const m = raw.match(/^(\d+)\s*(month|months|mo)$/i);
  if (m) { const n = parseInt(m[1], 10); return `${n} ${n === 1 ? 'Month' : 'Months'}`; }
  return raw;
}

function difficultyColor(d) {
  if (!d) return 'text-slate-500 bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.06]';
  const l = d.toLowerCase();
  if (l === 'easy') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/[0.08] border-emerald-200 dark:border-emerald-500/20';
  if (l === 'medium') return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/[0.08] border-amber-200 dark:border-amber-500/20';
  if (l === 'hard') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/[0.08] border-red-200 dark:border-red-500/20';
  return 'text-slate-500 bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.06]';
}

/* ── Status Config ── */
const statusConfig = {
  NOT_SUBMITTED: { label: 'Not Started', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-white/[0.04]', border: 'border-slate-200 dark:border-white/[0.06]', icon: CircleDot, ring: 'ring-slate-200 dark:ring-slate-700' },
  PENDING: { label: 'Pending Review', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/[0.08]', border: 'border-amber-200 dark:border-amber-500/20', icon: Hourglass, ring: 'ring-amber-200 dark:ring-amber-700' },
  REVIEWING: { label: 'Under Review', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/[0.08]', border: 'border-blue-200 dark:border-blue-500/20', icon: Eye, ring: 'ring-blue-200 dark:ring-blue-700' },
  APPROVED: { label: 'Approved', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/[0.08]', border: 'border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2, ring: 'ring-emerald-200 dark:ring-emerald-700' },
};

function normalizeTask(t) {
  const rawStatus = t.ReviewStatus ?? t.review_status ?? '';
  let reviewStatus = 'NOT_SUBMITTED';
  if (typeof rawStatus === 'string' && rawStatus) reviewStatus = rawStatus.toUpperCase();
  else if (rawStatus === true || t.Status === true) reviewStatus = 'APPROVED';
  return {
    taskNumber: t.TaskNumber ?? t.task_number ?? 1,
    title: t.Title ?? t.title ?? t.TaskName ?? t.task_name ?? 'Untitled Task',
    reviewStatus,
    githubLink: t.GitHubLink ?? t.github_link ?? '',
    submittedAt: t.SubmittedAt ?? t.submitted_at ?? null,
    reviewStatusChangedAt: t.ReviewStatusChangedAt ?? null,
    createdAt: t.CreatedAt ?? null,
  };
}

function normalizeTaskDetail(t) {
  return {
    roleID: t.RoleID ?? t.role_id ?? '',
    roleName: t.RoleName ?? t.role_name ?? '',
    duration: t.Duration ?? t.duration ?? '',
    taskNumber: t.TaskNumber ?? t.task_number ?? 1,
    title: t.Title ?? t.title ?? '',
    difficulty: t.Difficulty ?? t.difficulty ?? '',
    estimatedEffort: t.EstimatedEffort ?? t.estimated_effort ?? '',
    objective: t.Objective ?? t.objective ?? '',
    requirements: t.Requirements ?? t.requirements ?? [],
    techStack: t.TechStack ?? t.tech_stack ?? [],
    submission: t.Submission ?? t.submission ?? [],
    evaluationCriteria: t.EvaluationCriteria ?? t.evaluation_criteria ?? [],
    dataset: t.Dataset ?? t.dataset ?? null,
    status: t.Status ?? t.status ?? '',
    createdAt: t.CreatedAt ?? null,
    updatedAt: t.UpdatedAt ?? null,
  };
}

/* ── Stepper Connector Line ── */
function StepperConnector({ completed, active }) {
  return (
    <div className="flex items-center justify-center mx-auto" style={{ width: 32 }}>
      <div className={`w-0.5 h-8 rounded-full transition-all duration-500 ${
        completed ? 'bg-gradient-to-b from-emerald-400 to-emerald-500' :
        active ? 'bg-gradient-to-b from-primary-400 to-primary-500' :
        'bg-slate-200 dark:bg-white/[0.06]'
      }`} />
    </div>
  );
}

/* ── Stepper Step Circle ── */
function StepCircle({ taskNumber, status, isLocked, isActive, onClick }) {
  const st = statusConfig[status] || statusConfig.NOT_SUBMITTED;
  const StatusIcon = st.icon;
  return (
    <div className="flex flex-col items-center" style={{ width: 64 }}>
      <motion.button
        whileHover={!isLocked ? { scale: 1.1 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        onClick={!isLocked ? onClick : undefined}
        disabled={isLocked}
        className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isLocked
            ? 'bg-slate-100 dark:bg-white/[0.03] border-2 border-slate-200 dark:border-white/[0.06] cursor-not-allowed'
            : isActive
              ? 'bg-gradient-to-br from-primary-500 to-secondary-500 border-2 border-primary-400 dark:border-primary-500 shadow-lg shadow-primary-500/20'
              : status === 'APPROVED'
                ? 'bg-gradient-to-br from-emerald-500 to-green-500 border-2 border-emerald-400 dark:border-emerald-500 shadow-lg shadow-emerald-500/20'
                : status === 'PENDING' || status === 'REVIEWING'
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500 border-2 border-amber-400 dark:border-amber-500 shadow-lg shadow-amber-500/20'
                  : 'bg-white dark:bg-white/[0.04] border-2 border-slate-300 dark:border-white/[0.08] hover:border-primary-300 dark:hover:border-primary-500/30'
        }`}
      >
        {isLocked ? (
          <Lock className="w-4 h-4 text-slate-300 dark:text-white/20" />
        ) : status === 'APPROVED' ? (
          <CheckCircle2 className="w-5 h-5 text-white" />
        ) : status === 'PENDING' || status === 'REVIEWING' ? (
          <StatusIcon className="w-5 h-5 text-white" />
        ) : (
          <span className="text-sm font-extrabold text-slate-700 dark:text-white/80">{taskNumber}</span>
        )}
        {isActive && (
          <motion.div
            layoutId="activeStepRing"
            className="absolute -inset-1 rounded-2xl border-2 border-primary-400/40 dark:border-primary-500/30"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </motion.button>
      <span className={`mt-1.5 text-[10px] font-bold text-center leading-tight ${
        isLocked ? 'text-slate-300 dark:text-white/15' :
        isActive ? 'text-primary-600 dark:text-primary-400' :
        status === 'APPROVED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-white/40'
      }`}>
        {isLocked ? 'Locked' : status === 'APPROVED' ? 'Done' : status === 'PENDING' ? 'Pending' : status === 'REVIEWING' ? 'Review' : `Task ${taskNumber}`}
      </span>
    </div>
  );
}

/* ── StatCard ── */
function StatCard({ label, value, icon: Icon, gradient }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 p-5 shadow-sm"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.07]`} />
      <div className="relative flex items-center gap-3">
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-white/40 uppercase tracking-wide">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Requirement Section ── */
function RequirementSection({ section }) {
  if (!section || (!section.Section && !section.section)) return null;
  return (
    <div className="mb-3">
      <h5 className="text-sm font-bold text-slate-700 dark:text-white/80 mb-2 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
        {section.Section ?? section.section}
      </h5>
      <ul className="space-y-1.5 ml-4">
        {(section.Items ?? section.items ?? []).map((item, i) => (
          <li key={i} className="text-xs text-slate-600 dark:text-white/50 leading-relaxed flex items-start gap-2">
            <span className="text-primary-400 dark:text-primary-400 mt-0.5 shrink-0">•</span>
            <span className="font-mono text-[11px] bg-slate-50 dark:bg-white/[0.03] px-2 py-0.5 rounded-md border border-slate-100 dark:border-white/[0.04]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Expanded Task Detail Panel ── */
function TaskDetailPanel({ detail, taskNumber, reviewStatus, onSubmit }) {
  if (!detail) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-primary-500 animate-spin mr-2" />
        <span className="text-sm text-slate-400 dark:text-white/30">Loading task details...</span>
      </div>
    );
  }

  const st = statusConfig[reviewStatus] || statusConfig.NOT_SUBMITTED;
  const StatusIcon = st.icon;
  const isSubmitted = reviewStatus !== 'NOT_SUBMITTED';
  const canSubmit = reviewStatus === 'NOT_SUBMITTED';

  return (
    <div className="space-y-5">
      {/* Objective */}
      {detail.objective && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-500/[0.04] dark:to-secondary-500/[0.02] border border-primary-100/50 dark:border-primary-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary-500" />
            <h4 className="text-sm font-bold text-primary-700 dark:text-primary-300">Objective</h4>
          </div>
          <p className="text-sm text-slate-700 dark:text-white/60 leading-relaxed">{detail.objective}</p>
        </div>
      )}

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2">
        {detail.difficulty && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${difficultyColor(detail.difficulty)}`}>
            <Zap className="w-3 h-3" /> {detail.difficulty}
          </span>
        )}
        {detail.estimatedEffort && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border text-slate-600 dark:text-white/50 bg-slate-50 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.06]">
            <Clock className="w-3 h-3" /> {detail.estimatedEffort}
          </span>
        )}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${st.bg} ${st.color} ${st.border}`}>
          <StatusIcon className="w-3 h-3" /> {st.label}
        </span>
      </div>

      {/* Requirements */}
      {detail.requirements && detail.requirements.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-primary-500" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white/80">Requirements</h4>
          </div>
          {detail.requirements.map((section, i) => (
            <RequirementSection key={i} section={section} />
          ))}
        </div>
      )}

      {/* Tech Stack */}
      {detail.techStack && detail.techStack.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="w-4 h-4 text-primary-500" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white/80">Tech Stack</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {detail.techStack.map((tech, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-500/[0.06] dark:to-secondary-500/[0.04] text-primary-700 dark:text-primary-300 border border-primary-100/50 dark:border-primary-500/10">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Submission Guidelines */}
      {detail.submission && detail.submission.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary-500" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white/80">Submission Guidelines</h4>
          </div>
          <ul className="space-y-2">
            {detail.submission.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-white/50 leading-relaxed">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-lg bg-primary-50 dark:bg-primary-500/[0.06] flex items-center justify-center text-[10px] font-extrabold text-primary-600 dark:text-primary-400">{i + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evaluation Criteria */}
      {detail.evaluationCriteria && detail.evaluationCriteria.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white/80">Evaluation Criteria</h4>
          </div>
          <ul className="space-y-2">
            {detail.evaluationCriteria.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-white/50 leading-relaxed">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-lg bg-amber-50 dark:bg-amber-500/[0.06] flex items-center justify-center text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                  <Star className="w-3 h-3" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submitted GitHub Link */}
      {isSubmitted && detail.githubLink && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 mb-2">
            <GitPullRequest className="w-4 h-4 text-slate-400" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-white/70">Submitted Repository</h4>
          </div>
          <a href={detail.githubLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium break-all">
            {detail.githubLink}
          </a>
        </div>
      )}

      {/* Submit Area */}
      {canSubmit && (
        <div className="flex items-center gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSubmit(taskNumber)}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white text-sm font-bold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300"
          >
            <Send className="w-4 h-4" />
            Submit Task #{taskNumber}
          </motion.button>
        </div>
      )}

      {isSubmitted && (
        <div className={`flex items-center gap-2 p-3 rounded-xl ${st.bg} border ${st.border}`}>
          <StatusIcon className={`w-4 h-4 ${st.color}`} />
          <span className={`text-xs font-bold ${st.color}`}>
            {reviewStatus === 'PENDING' && 'Waiting for review...'}
            {reviewStatus === 'REVIEWING' && 'Currently being reviewed...'}
            {reviewStatus === 'APPROVED' && 'Task completed successfully!'}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Task Card (Stepper Style) ── */
function TaskCard({ task, index, isLocked, isActive, isExpanded, onToggle, onSubmit, taskDetail, submitting }) {
  const st = statusConfig[task.reviewStatus] || statusConfig.NOT_SUBMITTED;
  const StatusIcon = st.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        isLocked
          ? 'bg-slate-50 dark:bg-white/[0.01] border-slate-200 dark:border-white/[0.04] opacity-60'
          : isExpanded
            ? 'bg-white dark:bg-white/[0.02] border-primary-200 dark:border-primary-500/20 shadow-lg shadow-primary-500/5'
            : isActive
              ? 'bg-white dark:bg-white/[0.02] border-primary-200 dark:border-primary-500/15 hover:shadow-md'
              : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1] hover:shadow-sm'
      }`}
    >
      {/* Header */}
      <button
        onClick={() => !isLocked && onToggle()}
        disabled={isLocked}
        className={`w-full text-left px-5 py-4 flex items-center gap-4 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {/* Step Number */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
          isLocked ? 'bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]' :
          statusConfig[task.reviewStatus]?.bg || 'bg-slate-100 dark:bg-white/[0.04]'
        }`}>
          {isLocked ? (
            <Lock className="w-4 h-4 text-slate-300 dark:text-white/15" />
          ) : (
            <span className={`text-sm font-extrabold ${statusConfig[task.reviewStatus]?.color || 'text-slate-500 dark:text-white/50'}`}>
              {task.taskNumber}
            </span>
          )}
        </div>

        {/* Title + Status */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-bold tracking-tight ${isLocked ? 'text-slate-400 dark:text-white/20' : 'text-slate-900 dark:text-white'}`}>
            {task.title}
          </h4>
          <p className="text-[11px] text-slate-400 dark:text-white/30 mt-0.5">
            {isLocked ? 'Complete previous tasks first' : `Task ${task.taskNumber}`}
          </p>
        </div>

        {/* Status Pill */}
        {!isLocked && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${st.bg} ${st.color} ${st.border} ring-1 ${st.ring}`}>
            <StatusIcon className="w-3 h-3" />
            {st.label}
          </span>
        )}

        {/* Chevron */}
        {!isLocked && (
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/30" />
          </motion.div>
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-100 dark:border-white/[0.04] pt-4">
              <TaskDetailPanel
                detail={taskDetail}
                taskNumber={task.taskNumber}
                reviewStatus={task.reviewStatus}
                onSubmit={onSubmit}
                submitting={submitting}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Pagination Component ── */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] text-slate-500 dark:text-white/50 hover:bg-slate-50 dark:hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map(page => (
        <button key={page} onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
            page === currentPage ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md shadow-primary-500/20' : 'border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] text-slate-500 dark:text-white/50 hover:bg-slate-50 dark:hover:bg-white/[0.06]'
          }`}>
          {page}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] text-slate-500 dark:text-white/50 hover:bg-slate-50 dark:hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ── Main Page ── */
export default function InternshipDetailPage() {
  const { roleId, duration } = useParams();
  const { isAuthenticated } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [submitModal, setSubmitModal] = useState(null);
  const [githubLink, setGithubLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTask, setExpandedTask] = useState(null);
  const [taskDetails, setTaskDetails] = useState({});
  const TASKS_PER_PAGE = 5;

  /* ── Fetch tasks status ── */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasksStatus(roleId, duration);
      const raw = data.tasks ?? extractList(data, 'tasks', 'data', 'result');
      setTasks(raw.map(normalizeTask));
      setSummary(data.summary ?? null);
      setRoleName(data.role_name ?? roleId);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
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

  /* ── Fetch role name fallback ── */
  useEffect(() => {
    if (roleName === roleId || !roleName) {
      api.getRoles().then(data => {
        const roles = extractList(data, 'roles', 'data', 'result');
        const match = roles.find(r => (r.RoleID ?? r.role_id) === roleId);
        if (match) setRoleName(match.Name ?? match.name ?? match.role_name ?? roleId);
      }).catch(() => {});
    }
  }, [roleId, roleName]);

  /* ── Fetch task detail from /tasks API when expanding ── */
  const fetchTaskDetail = useCallback(async (taskNumber) => {
    if (taskDetails[taskNumber]) return;
    try {
      const data = await api.getTasks(roleId, duration);
      const raw = data.tasks ?? extractList(data, 'tasks', 'data', 'result');
      const task = raw.find(t => (t.TaskNumber ?? t.task_number) === taskNumber);
      if (task) {
        setTaskDetails(prev => ({ ...prev, [taskNumber]: normalizeTaskDetail(task) }));
      }
    } catch (err) {
      console.error('Failed to fetch task detail:', err);
      toast.error('Failed to load task details');
    }
  }, [roleId, duration, taskDetails]);

  /* ── Toggle expand ── */
  const handleToggle = useCallback((taskNumber) => {
    setExpandedTask(prev => {
      const next = prev === taskNumber ? null : taskNumber;
      if (next !== null) fetchTaskDetail(next);
      return next;
    });
  }, [fetchTaskDetail]);

  /* ── Submit task ── */
  const handleSubmitTask = async () => {
    if (!githubLink.trim()) { toast.warning('Please enter a GitHub link'); return; }
    setSubmitting(true);
    try {
      await api.submitTask(githubLink.trim(), roleId, duration, submitModal);
      toast.success('Task submitted! It will be reviewed shortly.');
      setSubmitModal(null);
      setGithubLink('');
      await fetchTasks();
    } catch (err) {
      toast.error(err.message || 'Task submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Determine if a task is locked ── */
  const isTaskLocked = (task) => {
    if (task.reviewStatus === 'APPROVED' || task.reviewStatus === 'PENDING' || task.reviewStatus === 'REVIEWING') return false;
    const prevTask = tasks.find(t => t.taskNumber === task.taskNumber - 1);
    if (!prevTask) return false;
    return prevTask.reviewStatus === 'NOT_SUBMITTED';
  };

  /* ── Find first unlocked + not submitted task ── */
  const activeTask = tasks.find(t => t.reviewStatus === 'NOT_SUBMITTED' && !isTaskLocked(t));

  /* ── Pagination ── */
  const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE);
  const paginatedTasks = tasks.slice((currentPage - 1) * TASKS_PER_PAGE, currentPage * TASKS_PER_PAGE);

  const percent = summary?.percent_approved ?? (tasks.length > 0 ? Math.round((tasks.filter(t => t.reviewStatus === 'APPROVED').length / tasks.length) * 100) : 0);
  const allApproved = summary?.all_approved ?? (tasks.length > 0 && tasks.every(t => t.reviewStatus === 'APPROVED'));

  return (
    <div className="py-10 bg-white dark:bg-black min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Back Link ── */}
        <Link to="/internships" className="inline-flex items-center gap-2 text-sm text-slate-400 dark:text-white/30 hover:text-slate-700 dark:hover:text-white/60 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Internships
        </Link>

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 p-8 sm:p-10 text-white mb-8"
        >
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/[0.07] rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/[0.05] rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.15] backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/20 shrink-0">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{roleName || roleId}</h1>
                <p className="text-white/60 text-sm font-medium">{formatDuration(duration)} Program</p>

                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.1] backdrop-blur-sm text-xs font-bold border border-white/[0.1]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {tasks.length} Tasks
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.1] backdrop-blur-sm text-xs font-bold border border-white/[0.1]">
                    <Clock className="w-3.5 h-3.5" /> {percent}% Approved
                  </span>
                  {allApproved && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-sm text-xs font-bold border border-emerald-400/30 text-emerald-200">
                      <Rocket className="w-3.5 h-3.5" /> All Approved!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-white/40 text-sm">Loading tasks...</p>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
            <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
            {!isAuthenticated ? (
              <Link to="/login" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all">Log In</Link>
            ) : (
              <button onClick={fetchTasks} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-sm font-semibold hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all">Retry</button>
            )}
          </div>
        )}

        {/* ── Stats Cards ── */}
        {!loading && !error && summary && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard label="Total Tasks" value={summary.total_tasks ?? summary.total ?? tasks.length} icon={CheckCircle2} gradient="from-slate-500 to-slate-600" />
            <StatCard label="Approved" value={summary.approved ?? 0} icon={CheckCircle2} gradient="from-emerald-500 to-green-600" />
            <StatCard label="Pending" value={(summary.pending ?? 0) + (summary.reviewing ?? 0)} icon={Clock} gradient="from-amber-500 to-orange-500" />
            <StatCard label="Not Started" value={summary.not_submitted ?? tasks.filter(t => t.reviewStatus === 'NOT_SUBMITTED').length} icon={CircleDot} gradient="from-slate-400 to-slate-500" />
          </motion.div>
        )}

        {/* ── Progress Bar ── */}
        {!loading && !error && tasks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-700 dark:text-white/70">Overall Progress</span>
              <span className="text-sm font-extrabold text-primary-600 dark:text-primary-400">{percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full rounded-full ${allApproved ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-primary-500 to-secondary-500'}`}
              />
            </div>
          </motion.div>
        )}

        {/* ── All Approved Banner ── */}
        {!loading && allApproved && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-500/[0.06] dark:to-green-500/[0.03] border border-emerald-200 dark:border-emerald-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300">All Tasks Approved!</h3>
                <p className="text-emerald-600 dark:text-emerald-400/60 text-xs">Congratulations on completing all tasks</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link to="/certificates-list" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
                <Award className="w-4 h-4" /> View Certificate
              </Link>
              <Link to="/offer-letters" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-white/[0.06] border border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all">
                <FileText className="w-4 h-4" /> View Offer Letter
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── Stepper Timeline ── */}
        {!loading && !error && tasks.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-0 overflow-x-auto pb-2">
              {tasks.map((task, i) => (
                <div key={task.taskNumber} className="flex items-center">
                  <StepCircle
                    taskNumber={task.taskNumber}
                    status={task.reviewStatus}
                    isLocked={isTaskLocked(task)}
                    isActive={expandedTask === task.taskNumber}
                    onClick={() => handleToggle(task.taskNumber)}
                  />
                  {i < tasks.length - 1 && (
                    <StepperConnector
                      completed={task.reviewStatus === 'APPROVED'}
                      active={expandedTask === task.taskNumber}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Task List ── */}
        {!loading && !error && tasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                Task Details
              </h2>
              <span className="text-xs text-slate-400 dark:text-white/30 font-medium">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            {paginatedTasks.map((task, i) => (
              <TaskCard
                key={task.taskNumber}
                task={task}
                index={i}
                isLocked={isTaskLocked(task)}
                isActive={activeTask?.taskNumber === task.taskNumber}
                isExpanded={expandedTask === task.taskNumber}
                onToggle={() => handleToggle(task.taskNumber)}
                onSubmit={(num) => setSubmitModal(num)}
                taskDetail={taskDetails[task.taskNumber] || null}
                submitting={submitting && submitModal === task.taskNumber}
              />
            ))}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => { setCurrentPage(p); setExpandedTask(null); }} />
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && tasks.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-slate-400 dark:text-white/30 text-sm">No tasks found for this role.</p>
          </div>
        )}

        {/* ── Submit Modal ── */}
        <AnimatePresence>
          {submitModal !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => { setSubmitModal(null); setGithubLink(''); }} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden"
              >
                {/* Modal Header */}
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center border border-primary-100 dark:border-primary-500/15">
                        <Send className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Task</h3>
                        <p className="text-xs text-slate-400 dark:text-white/30">Task #{submitModal}</p>
                      </div>
                    </div>
                    <button onClick={() => { setSubmitModal(null); setGithubLink(''); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
                      <X className="w-4 h-4 text-slate-400 dark:text-white/40" />
                    </button>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04] mb-4">
                    <p className="text-xs text-slate-500 dark:text-white/35 mb-1 font-medium">Paste your GitHub repository link below. The link should point to a public repository with your completed task.</p>
                  </div>

                  <label className="block text-sm font-bold text-slate-700 dark:text-white/70 mb-2">GitHub Repository Link</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/repo"
                    value={githubLink}
                    onChange={e => setGithubLink(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all mb-5"
                    onKeyDown={e => e.key === 'Enter' && handleSubmitTask()}
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setSubmitModal(null); setGithubLink(''); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitTask}
                      disabled={submitting || !githubLink.trim()}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {submitting ? 'Submitting...' : 'Submit'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
