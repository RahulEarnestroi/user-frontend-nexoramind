import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Calendar, Search, Briefcase, CheckCircle2, Loader2, AlertCircle, X, ExternalLink, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { api, extractList } from '../../services/api';

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

function normalizeOL(o) {
  return {
    offerLetterId: o.OfferLetterID ?? o.offer_letter_id ?? '',
    roleId: o.RoleID ?? o.role_id ?? '',
    roleName: o.RoleName ?? o.role_name ?? '',
    duration: o.Duration ?? o.duration ?? '',
    durationDisplay: o.DurationDisplay ?? o.duration_display ?? '',
    startDate: o.StartDate ?? o.start_date ?? '',
    endDate: o.EndDate ?? o.end_date ?? '',
    startEndDate: o.StartEndDate ?? o.start_end_date ?? o.DateRange ?? '',
    currentDate: o.CurrentDate ?? o.current_date ?? '',
    totalTasks: o.TotalTasks ?? o.total_tasks ?? 0,
    status: o.Status ?? o.status ?? 'DELIVERABLE',
    issuedAt: o.IssuedAt ?? o.issued_at ?? o.CreatedAt ?? o.created_at ?? '',
    renderedHtml: o.RenderedHTML ?? o.renderedHTML ?? o.rendered_html ?? '',
  };
}

export default function OfferLettersPage() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [offerLetters, setOfferLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewing, setViewing] = useState(null);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [loadingHtml, setLoadingHtml] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    api.listOfferLetters()
      .then(data => {
        const raw = extractList(data, 'offer_letters', 'data', 'result', 'offerLetters');
        setOfferLetters(raw.map(normalizeOL));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleView = useCallback(async (ol) => {
    setViewing(ol);
    setRenderedHtml('');
    setLoadingHtml(true);
    try {
      const data = await api.getOfferLetter(ol.roleId, ol.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      setRenderedHtml(html);
    } catch (err) {
      toast.error(err.message || 'Failed to load offer letter');
      setViewing(null);
    } finally {
      setLoadingHtml(false);
    }
  }, []);

  const handleDownload = useCallback(async (ol) => {
    try {
      const data = await api.getOfferLetter(ol.roleId, ol.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      if (!html) { toast.error('No offer letter content available'); return; }

      // 1. Convert Logo.png to base64 so relative paths resolve
      const logoRes = await fetch('/Logo.png');
      const logoBlob = await logoRes.blob();
      const logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(logoBlob);
      });

      const fixedHtml = html
        .replace(/src="Logo\.png"/g, `src="${logoBase64}"`)
        .replace(/src='Logo\.png'/g, `src='${logoBase64}'`)
        .replace(/url\(Logo\.png\)/g, `url(${logoBase64})`);

      // 2. Add print-friendly CSS and auto-print script
      const printReadyHtml = fixedHtml.replace(
        '</head>',
        `<style>
          @media print {
            body { background: #fff !important; padding: 0 !important; margin: 0 !important; min-height: auto !important; display: block !important; justify-content: unset !important; align-items: unset !important; }
            .document { box-shadow: none !important; border-radius: 0 !important; margin: 0 auto !important; page-break-inside: avoid; }
          }
        </style>
        <script>
          window.onload = function() {
            document.fonts.ready.then(function() {
              setTimeout(function() { window.print(); }, 300);
            });
          };
        </script>
        </head>`
      );

      // 3. Create blob URL with proper origin for fonts
      const blob = new Blob([printReadyHtml], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);

      // 4. Open in a new window — browser renders it perfectly
      const printWindow = window.open(blobUrl, '_blank');
      if (!printWindow) {
        toast.warning('Popup blocked. Please allow popups for this site and try again.');
        URL.revokeObjectURL(blobUrl);
        return;
      }

      toast.success('Opening print dialog — select "Save as PDF" to download.');
    } catch (err) {
      toast.error(err.message || 'Failed to prepare offer letter');
      console.error('Offer letter PDF error:', err);
    }
  }, []);

  const filtered = offerLetters.filter(ol =>
    ol.roleName?.toLowerCase().includes(search.toLowerCase()) ||
    ol.roleId?.toLowerCase().includes(search.toLowerCase()) ||
    ol.offerLetterId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-20 bg-white dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
            <FileText className="w-3 h-3" /> Offer Letters
          </span>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Internship Offer Letters</h1>
          <p className="mt-4 text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg font-normal">
            View and download your official internship offer letters from NexoraMind Tech.
          </p>
        </motion.div>

        {!isAuthenticated && !loading && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-white/40 text-sm mb-4">Please log in to view your offer letters.</p>
            <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all">
              Log In
            </Link>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-white/40 text-sm">Loading offer letters...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
            <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {isAuthenticated && !loading && !error && (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" />
                <input
                  type="text"
                  placeholder="Search by role, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {filtered.map((ol, i) => (
                <motion.div
                  key={ol.offerLetterId || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-2xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> {ol.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{ol.roleName}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-slate-400 dark:text-white/30" />
                    <span className="text-sm text-slate-500 dark:text-white/40">{ol.durationDisplay || formatDuration(ol.duration)}</span>
                  </div>

                  {ol.startEndDate && (
                    <div className="flex items-center gap-3 text-sm text-slate-400 dark:text-white/40 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-300 dark:text-white/25" />
                        <span>{ol.startEndDate}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs text-slate-400 dark:text-white/25 font-mono">{ol.offerLetterId}</span>
                    <span className="text-xs text-slate-400 dark:text-white/25">
                      {ol.issuedAt ? new Date(ol.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(ol)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-white/50 text-xs font-medium hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => handleDownload(ol)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-white/50 text-xs font-medium hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-200 dark:hover:border-primary-500/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-slate-200 dark:text-white/10 mx-auto mb-4" />
                <p className="text-slate-400 dark:text-white/30 text-sm">No offer letters found.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setViewing(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-4xl h-[85vh] bg-white dark:bg-primary-950 rounded-2xl border border-slate-200 dark:border-white/[0.1] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/[0.06]">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Offer Letter — {viewing.roleName}</h3>
                <button onClick={() => setViewing(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white/60 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                {loadingHtml ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                  </div>
                ) : renderedHtml ? (
                  <iframe srcDoc={renderedHtml} title="Offer Letter" className="w-full h-full border-0" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                    <p className="text-slate-500 dark:text-white/40 text-sm">No content available</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
