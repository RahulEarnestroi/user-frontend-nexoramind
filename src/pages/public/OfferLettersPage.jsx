import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Calendar, Search, Briefcase, CheckCircle2, Loader2, AlertCircle, X, ExternalLink, Image, FileDown } from 'lucide-react';
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

/* ── Helper: prepare HTML with base64 logo and embedded fonts ── */
async function prepareHtml(rawHtml) {
  if (!rawHtml) return '';
  // Convert Logo.png to base64
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

  // Inject Google Fonts if not already present
  if (!html.includes('fonts.googleapis.com')) {
    const fontLink = `<link rel="preconnect" href="https://fonts.googleapis.com" />\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Playfair+Display:wght@400;500;600;700&family=Great+Vibes&display=swap" rel="stylesheet" />`;
    html = html.replace('</head>', `${fontLink}\n</head>`);
  }
  return html;
}

/* ── Helper: render HTML in a hidden container and wait for fonts ── */
function renderInContainer(html) {
  return new Promise((resolve) => {
    const existing = document.getElementById('offer-letter-renderer');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'offer-letter-renderer';
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

    // Wait for fonts to load then resolve
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
    setTimeout(checkReady, 2000); // fallback
  });
}

/* ── Helper: capture PNG from iframe ── */
async function capturePng(iframe) {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(iframe.contentDocument.body, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: 820,
    windowWidth: 820,
  });
  return canvas.toDataURL('image/png');
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

  /* ── Download as PNG ── */
  const handleDownloadPNG = useCallback(async (ol) => {
    setDownloading(ol.offerLetterId + '_png');
    try {
      const data = await api.getOfferLetter(ol.roleId, ol.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      if (!html) { toast.error('No offer letter content available'); return; }

      const prepared = await prepareHtml(html);
      const { container, iframe } = await renderInContainer(prepared);
      const pngDataUrl = await capturePng(iframe);

      // Cleanup
      container.remove();

      // Download
      const link = document.createElement('a');
      link.download = `OfferLetter_${ol.roleName}_${ol.duration}.png`;
      link.href = pngDataUrl;
      link.click();

      toast.success('Offer letter downloaded as PNG!');
    } catch (err) {
      toast.error(err.message || 'Failed to download PNG');
      console.error('PNG download error:', err);
    } finally {
      setDownloading(null);
      const el = document.getElementById('offer-letter-renderer');
      if (el) el.remove();
    }
  }, []);

  /* ── Download as PDF ── */
  const handleDownloadPDF = useCallback(async (ol) => {
    setDownloading(ol.offerLetterId + '_pdf');
    try {
      const data = await api.getOfferLetter(ol.roleId, ol.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      if (!html) { toast.error('No offer letter content available'); return; }

      const prepared = await prepareHtml(html);
      const { container, iframe } = await renderInContainer(prepared);
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: 0,
        filename: `OfferLetter_${ol.roleName}_${ol.duration}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', width: 820, windowWidth: 820 },
        jsPDF: { unit: 'px', format: [820, 1200], orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf().set(opt).from(iframe.contentDocument.body).save();
      container.remove();
      toast.success('Offer letter downloaded as PDF!');
    } catch (err) {
      toast.error(err.message || 'Failed to download PDF');
      console.error('PDF download error:', err);
    } finally {
      setDownloading(null);
      const el = document.getElementById('offer-letter-renderer');
      if (el) el.remove();
    }
  }, []);

  /* ── Download via print (fallback) ── */
  const handleDownloadPrint = useCallback(async (ol) => {
    try {
      const data = await api.getOfferLetter(ol.roleId, ol.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      if (!html) { toast.error('No offer letter content available'); return; }

      const prepared = await prepareHtml(html);
      const printHtml = prepared.replace(
        '</head>',
        `<style>@media print{body{background:#fff!important;padding:0!important;margin:0!important;min-height:auto!important;display:block!important;justify-content:unset!important;align-items:unset!important;}.document{box-shadow:none!important;border-radius:0!important;margin:0 auto!important;}}</style>
        <script>window.onload=function(){document.fonts.ready.then(function(){setTimeout(function(){window.print();},500);});};</script></head>`
      );

      const blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank');
      if (!win) { toast.warning('Popup blocked. Allow popups for this site.'); URL.revokeObjectURL(blobUrl); return; }
      // toast.success('Opening print dialog — select "Save as PDF" to download.');
    } catch (err) {
      toast.error(err.message || 'Failed to prepare offer letter');
    }
  }, []);

  const filtered = offerLetters.filter(ol =>
    ol.roleName?.toLowerCase().includes(search.toLowerCase()) ||
    ol.roleId?.toLowerCase().includes(search.toLowerCase()) ||
    ol.offerLetterId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-5 bg-white dark:bg-black min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
            <FileText className="w-3 h-3" /> Offer Letters
          </span>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Internship Offer Letters</h1>
          <p className="mt-4 text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg font-normal">View and download your official internship offer letters from NexoraMind Tech.</p>
        </motion.div>

        {!isAuthenticated && !loading && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-white/40 text-sm mb-4">Please log in to view your offer letters.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all">Log In</Link>
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

            <div className="grid md:grid-cols-4 gap-6 mx-auto">
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
                      onClick={() => setDownloadModal(ol)}
                      disabled={downloading === ol.offerLetterId + '_png' || downloading === ol.offerLetterId + '_pdf'}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-white/50 text-xs font-medium hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-200 dark:hover:border-primary-500/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading === ol.offerLetterId + '_png' || downloading === ol.offerLetterId + '_pdf' ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                      ) : (
                        <><Download className="w-3.5 h-3.5" /> Download</>
                      )}
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

      {/* ── View Modal ── */}
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
              className="w-full max-w-4xl h-[85vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/[0.1] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/[0.06]">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Offer Letter — {viewing.roleName}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPNG(viewing)}
                    disabled={downloading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-xs font-medium text-slate-600 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all disabled:opacity-50"
                  >
                    <Image className="w-3.5 h-3.5" /> PNG
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(viewing)}
                    disabled={downloading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-xs font-medium text-slate-600 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all disabled:opacity-50"
                  >
                    <FileDown className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button onClick={() => setViewing(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white/60 transition-colors">
                    <X className="w-5 h-5" />
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setDownloadModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Download Offer Letter</h3>
                    <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">{downloadModal.roleName}</p>
                  </div>
                  <button onClick={() => setDownloadModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
                    <X className="w-4 h-4 text-slate-400 dark:text-white/40" />
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => { handleDownloadPNG(downloadModal); setDownloadModal(null); }}
                    disabled={!!downloading}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:border-primary-300 dark:hover:border-primary-500/20 hover:bg-primary-50/50 dark:hover:bg-primary-500/[0.04] transition-all group disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/20 shrink-0">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Download as PNG</p>
                      <p className="text-xs text-slate-400 dark:text-white/30">High quality image file</p>
                    </div>
                  </button>

                  {/* <button
                    onClick={() => { handleDownloadPDF(downloadModal); setDownloadModal(null); }}
                    disabled={!!downloading}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:border-primary-300 dark:hover:border-primary-500/20 hover:bg-primary-50/50 dark:hover:bg-primary-500/[0.04] transition-all group disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-sm shadow-red-500/20 shrink-0">
                      <FileDown className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Download as PDF</p>
                      <p className="text-xs text-slate-400 dark:text-white/30">Print-ready document</p>
                    </div>
                  </button> */}

                  <button
                    onClick={() => { handleDownloadPrint(downloadModal); setDownloadModal(null); }}
                    disabled={!!downloading}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:border-primary-300 dark:hover:border-primary-500/20 hover:bg-primary-50/50 dark:hover:bg-primary-500/[0.04] transition-all group disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-sm shadow-primary-500/20 shrink-0">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Print / Save as PDF</p>
                      <p className="text-xs text-slate-400 dark:text-white/30">Open print dialog for custom options</p>
                    </div>
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