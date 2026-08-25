import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Calendar, Search, Briefcase, CheckCircle2,
  Loader2, AlertCircle, X, ExternalLink, Image, FileDown,
  ArrowRight, Shield, Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { api, extractList } from '../../services/api';

function formatDuration(raw) {
  if (!raw) return '';
  if (/\s/.test(raw) && /[A-Z]/.test(raw)) return raw;
  const m = raw.match(/^(\d+)\s*(month|months|mo)$/i);
  if (m) { const n = parseInt(m[1], 10); return `${n} ${n === 1 ? 'Month' : 'Months'}`; }
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

async function prepareHtml(rawHtml) {
  if (!rawHtml) return '';
  let logoBase64 = '';
  try {
    const logoRes = await fetch('/Logo.png');
    const logoBlob = await logoRes.blob();
    logoBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(logoBlob);
    });
  } catch { /* skip */ }

  let html = rawHtml
    .replace(/src="Logo\.png"/g, `src="${logoBase64}"`)
    .replace(/src='Logo\.png'/g, `src='${logoBase64}'`)
    .replace(/url\(Logo\.png\)/g, `url(${logoBase64})`);

  if (!html.includes('fonts.googleapis.com')) {
    const fontLink = `<link rel="preconnect" href="https://fonts.googleapis.com" />\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Playfair+Display:wght@400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet" />`;
    html = html.replace('</head>', `${fontLink}\n</head>`);
  }
  return html;
}

function renderInContainer(html, id = 'offer-letter-renderer') {
  return new Promise((resolve) => {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = id;
    container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:820px;z-index:-1;background:#fff;';
    document.body.appendChild(container);

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:820px;border:0;overflow:hidden;';
    iframe.setAttribute('scrolling', 'no');
    container.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    const checkReady = () => {
      try {
        if (iframe.contentDocument && iframe.contentDocument.fonts) {
          iframe.contentDocument.fonts.ready.then(() => {
            setTimeout(() => resolve({ container, iframe }), 600);
          });
        } else {
          setTimeout(() => resolve({ container, iframe }), 1000);
        }
      } catch {
        setTimeout(() => resolve({ container, iframe }), 1000);
      }
    };
    iframe.onload = checkReady;
    setTimeout(checkReady, 2000);
  });
}

async function capturePng(iframe) {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(iframe.contentDocument.body, {
    scale: 2, useCORS: true, allowTaint: true,
    backgroundColor: '#ffffff', width: 820, windowWidth: 820,
  });
  return canvas.toDataURL('image/png');
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

export default function OfferLettersPage() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [offerLetters, setOfferLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [loadingHtml, setLoadingHtml] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [downloadModal, setDownloadModal] = useState(null);

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

  const handleDownloadPNG = useCallback(async (ol) => {
    setDownloading(ol.offerLetterId + '_png');
    try {
      const data = await api.getOfferLetter(ol.roleId, ol.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      if (!html) { toast.error('No offer letter content available'); return; }
      const prepared = await prepareHtml(html);
      const { container, iframe } = await renderInContainer(prepared);
      const pngDataUrl = await capturePng(iframe);
      container.remove();
      const link = document.createElement('a');
      link.download = `OfferLetter_${ol.roleName}_${ol.duration}.png`;
      link.href = pngDataUrl;
      link.click();
      toast.success('Offer letter downloaded as PNG!');
    } catch (err) {
      toast.error(err.message || 'Failed to download PNG');
    } finally {
      setDownloading(null);
      const el = document.getElementById('offer-letter-renderer');
      if (el) el.remove();
    }
  }, []);

  const handleDownloadPDF = useCallback(async (ol) => {
    setDownloading(ol.offerLetterId + '_pdf');
    try {
      const data = await api.getOfferLetter(ol.roleId, ol.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      if (!html) { toast.error('No offer letter content available'); return; }
      const prepared = await prepareHtml(html);
      const { container, iframe } = await renderInContainer(prepared);
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set({
        margin: 0, filename: `OfferLetter_${ol.roleName}_${ol.duration}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', width: 820, windowWidth: 820 },
        jsPDF: { unit: 'px', format: [820, 1200], orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }).from(iframe.contentDocument.body).save();
      container.remove();
      toast.success('Offer letter downloaded as PDF!');
    } catch (err) {
      toast.error(err.message || 'Failed to download PDF');
    } finally {
      setDownloading(null);
      const el = document.getElementById('offer-letter-renderer');
      if (el) el.remove();
    }
  }, []);

  const handleDownloadPrint = useCallback(async (ol) => {
    try {
      const data = await api.getOfferLetter(ol.roleId, ol.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      if (!html) { toast.error('No offer letter content available'); return; }
      const prepared = await prepareHtml(html);
      const printHtml = prepared.replace('</head>',
        `<style>@media print{body{background:#fff!important;padding:0!important;margin:0!important;min-height:auto!important;display:block!important;justify-content:unset!important;align-items:unset!important;}.document{box-shadow:none!important;border-radius:0!important;margin:0 auto!important;}}</style>
        <script>window.onload=function(){document.fonts.ready.then(function(){setTimeout(function(){window.print();},500);});};</script></head>`
      );
      const blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank');
      if (!win) { toast.warning('Popup blocked. Allow popups for this site.'); URL.revokeObjectURL(blobUrl); return; }
      toast.success('Opening print dialog — select "Save as PDF" to download.');
    } catch (err) { toast.error(err.message || 'Failed to prepare offer letter'); }
  }, []);

  const filtered = offerLetters.filter(ol =>
    ol.roleName?.toLowerCase().includes(search.toLowerCase()) ||
    ol.roleId?.toLowerCase().includes(search.toLowerCase()) ||
    ol.offerLetterId?.toLowerCase().includes(search.toLowerCase())
  );

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
              <FileText className="w-3.5 h-3.5" /> Official Documents
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">Offer Letters</h1>
            <p className="text-white/50 max-w-xl mx-auto text-base font-normal">View and download your official internship offer letters from NexoraMind Tech.</p>

            {/* Stats Row */}
            {!loading && offerLetters.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.1] backdrop-blur-sm border border-white/[0.1]">
                  <FileText className="w-4 h-4 text-white/60" />
                  <span className="text-sm font-bold text-white">{offerLetters.length}</span>
                  <span className="text-xs text-white/40">Total</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.1] backdrop-blur-sm border border-white/[0.1]">
                  <Shield className="w-4 h-4 text-emerald-300" />
                  <span className="text-sm font-bold text-emerald-300">{offerLetters.filter(ol => ol.status).length}</span>
                  <span className="text-xs text-white/40">Verified</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">

        {/* ── Not Authenticated ── */}
        {!isAuthenticated && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300 dark:text-white/20" />
            </div>
            <p className="text-slate-500 dark:text-white/40 text-sm mb-5">Please log in to view your offer letters.</p>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/20 transition-all">
              Log In <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
              <div className="absolute inset-0 w-10 h-10 rounded-full bg-primary-500/10 animate-ping" />
            </div>
            <p className="text-slate-400 dark:text-white/30 text-sm mt-4 font-medium">Loading offer letters...</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-white dark:bg-white/[0.02] rounded-2xl border border-red-200 dark:border-red-500/20">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/[0.06] flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-red-500 dark:text-red-400 text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* ── Content ── */}
        {isAuthenticated && !loading && !error && (
          <div className="pb-12">
            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" />
                <input
                  type="text"
                  placeholder="Search by role, ID, or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-500/10 shadow-sm transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((ol, i) => (
                <motion.div
                  key={ol.offerLetterId || i}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group relative bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] hover:border-primary-200 dark:hover:border-primary-500/20 shadow-sm hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300 overflow-hidden"
                >
                  {/* Top accent */}
                  <div className="h-1 w-full bg-gradient-to-r from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-100/50 dark:border-primary-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      {ol.status && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200/60 dark:border-emerald-500/15">
                          <CheckCircle2 className="w-3 h-3" /> {ol.status}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{ol.roleName}</h3>

                    {/* Duration + Date */}
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-white/25" />
                      <span className="text-sm text-slate-500 dark:text-white/40 font-medium">{ol.durationDisplay || formatDuration(ol.duration)}</span>
                      {ol.startEndDate && (
                        <>
                          <span className="text-slate-200 dark:text-white/10">|</span>
                          <Calendar className="w-3.5 h-3.5 text-slate-300 dark:text-white/20" />
                          <span className="text-xs text-slate-400 dark:text-white/30">{ol.startEndDate}</span>
                        </>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-white/[0.04]">
                      <span className="text-[10px] text-slate-400 dark:text-white/20 font-mono tracking-wide">{ol.offerLetterId}</span>
                      {ol.issuedAt && (
                        <span className="text-[11px] text-slate-400 dark:text-white/25 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(ol.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleView(ol)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-white/50 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1] transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Preview
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDownloadModal(ol)}
                        disabled={downloading === ol.offerLetterId + '_png' || downloading === ol.offerLetterId + '_pdf'}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-bold shadow-sm shadow-primary-500/15 hover:shadow-md hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloading === ol.offerLetterId + '_png' || downloading === ol.offerLetterId + '_pdf' ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                        ) : (
                          <><Download className="w-3.5 h-3.5" /> Download</>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06]">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-300 dark:text-white/15" />
                </div>
                <p className="text-slate-500 dark:text-white/30 text-sm font-medium">
                  {search ? 'No offer letters match your search.' : 'No offer letters found.'}
                </p>
                {search && (
                  <button onClick={() => setSearch('')} className="mt-3 text-xs text-primary-500 hover:text-primary-600 font-semibold transition-colors">Clear search</button>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ── View Modal ── */}
      <AnimatePresence>
        {viewing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setViewing(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-4xl h-[85vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/[0.1] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewing.roleName}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownloadPNG(viewing)} disabled={!!downloading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-600 dark:text-white/50 hover:border-emerald-300 dark:hover:border-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all disabled:opacity-50">
                    <Image className="w-3.5 h-3.5" /> PNG
                  </button>
                  <button onClick={() => handleDownloadPDF(viewing)} disabled={!!downloading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-600 dark:text-white/50 hover:border-red-300 dark:hover:border-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-all disabled:opacity-50">
                    <FileDown className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button onClick={() => setViewing(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
                    <X className="w-4 h-4 text-slate-400 dark:text-white/40" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-800">
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

      {/* ── Download Format Modal ── */}
      <AnimatePresence>
        {downloadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDownloadModal(null)}>
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Download Offer Letter</h3>
                    <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">{downloadModal.roleName} · {formatDuration(downloadModal.duration)}</p>
                  </div>
                  <button onClick={() => setDownloadModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
                    <X className="w-4 h-4 text-slate-400 dark:text-white/40" />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-2.5">
                <button onClick={() => { handleDownloadPNG(downloadModal); setDownloadModal(null); }} disabled={!!downloading}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:border-emerald-300 dark:hover:border-emerald-500/20 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/[0.04] transition-all group disabled:opacity-50 text-left">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-sm shadow-emerald-500/20 shrink-0">
                    <Image className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Download as PNG</p>
                    <p className="text-[11px] text-slate-400 dark:text-white/25 mt-0.5">High quality image file</p>
                  </div>
                </button>

                <button onClick={() => { handleDownloadPDF(downloadModal); setDownloadModal(null); }} disabled={!!downloading}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:border-red-300 dark:hover:border-red-500/20 hover:bg-red-50/50 dark:hover:bg-red-500/[0.04] transition-all group disabled:opacity-50 text-left">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-sm shadow-red-500/20 shrink-0">
                    <FileDown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Download as PDF</p>
                    <p className="text-[11px] text-slate-400 dark:text-white/25 mt-0.5">Print-ready document</p>
                  </div>
                </button>

                <button onClick={() => { handleDownloadPrint(downloadModal); setDownloadModal(null); }} disabled={!!downloading}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:border-primary-300 dark:hover:border-primary-500/20 hover:bg-primary-50/50 dark:hover:bg-primary-500/[0.04] transition-all group disabled:opacity-50 text-left">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-sm shadow-primary-500/20 shrink-0">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Print / Save as PDF</p>
                    <p className="text-[11px] text-slate-400 dark:text-white/25 mt-0.5">Open print dialog for custom options</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}