import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Search, Calendar, Shield, Loader2, AlertCircle, X, ExternalLink, Image, FileDown } from 'lucide-react';
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

function normalizeCert(c) {
  return {
    certificateId: c.CertificateID ?? c.certificate_id ?? '',
    roleId: c.RoleID ?? c.role_id ?? '',
    roleName: c.RoleName ?? c.role_name ?? '',
    duration: c.Duration ?? c.duration ?? '',
    durationDisplay: c.DurationDisplay ?? c.duration_display ?? '',
    startDate: c.StartDate ?? c.start_date ?? '',
    endDate: c.EndDate ?? c.end_date ?? '',
    dateRange: c.DateRange ?? c.date_range ?? '',
    totalTasks: c.TotalTasks ?? c.total_tasks ?? 0,
    status: c.Status ?? c.status ?? '',
    issuedAt: c.IssuedAt ?? c.issued_at ?? c.CreatedAt ?? c.created_at ?? '',
    renderedHtml: c.RenderedHTML ?? c.renderedHTML ?? c.rendered_html ?? '',
  };
}

/* ── Helper: prepare HTML with base64 logo and embedded fonts ── */
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

/* ── Helper: render HTML in a hidden container and wait for fonts ── */
function renderInContainer(html) {
  return new Promise((resolve) => {
    const existing = document.getElementById('cert-renderer');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'cert-renderer';
    container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1100px;z-index:-1;background:#fff;';
    document.body.appendChild(container);

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:1100px;border:0;overflow:hidden;';
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

/* ── Helper: capture PNG from iframe ── */
async function capturePng(iframe) {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(iframe.contentDocument.body, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: 1100,
    windowWidth: 1100,
  });
  return canvas.toDataURL('image/png');
}

export default function PublicCertificatesPage() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewing, setViewing] = useState(null);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [loadingHtml, setLoadingHtml] = useState(false);

  const [downloading, setDownloading] = useState(null);
  const [downloadModal, setDownloadModal] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    api.listCertificates()
      .then(data => {
        const raw = extractList(data, 'certificates', 'data', 'result');
        setCertificates(raw.map(normalizeCert));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleView = useCallback(async (cert) => {
    setViewing(cert);
    setRenderedHtml('');
    setLoadingHtml(true);
    try {
      const data = await api.getCertificate(cert.roleId, cert.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      setRenderedHtml(html);
    } catch (err) {
      toast.error(err.message || 'Failed to load certificate');
      setViewing(null);
    } finally {
      setLoadingHtml(false);
    }
  }, []);

  /* ── Download as PNG ── */
  const handleDownloadPNG = useCallback(async (cert) => {
    setDownloading(cert.certificateId + '_png');
    try {
      const data = await api.getCertificate(cert.roleId, cert.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      if (!html) { toast.error('No certificate content available'); return; }

      const prepared = await prepareHtml(html);
      const { container, iframe } = await renderInContainer(prepared);
      const pngDataUrl = await capturePng(iframe);
      container.remove();

      const link = document.createElement('a');
      link.download = `Certificate_${cert.roleName}_${cert.duration}.png`;
      link.href = pngDataUrl;
      link.click();
      toast.success('Certificate downloaded as PNG!');
    } catch (err) {
      toast.error(err.message || 'Failed to download PNG');
      console.error('PNG download error:', err);
    } finally {
      setDownloading(null);
      const el = document.getElementById('cert-renderer');
      if (el) el.remove();
    }
  }, []);

  /* ── Download as PDF ── */
  const handleDownloadPDF = useCallback(async (cert) => {
    setDownloading(cert.certificateId + '_pdf');
    try {
      const data = await api.getCertificate(cert.roleId, cert.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      if (!html) { toast.error('No certificate content available'); return; }

      const prepared = await prepareHtml(html);
      const { container, iframe } = await renderInContainer(prepared);
      const html2pdf = (await import('html2pdf.js')).default;

      await html2pdf()
        .set({
          margin: 0,
          filename: `Certificate_${cert.roleName}_${cert.duration}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', width: 1100, windowWidth: 1100 },
          jsPDF: { unit: 'px', format: [1100, 800], orientation: 'landscape' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(iframe.contentDocument.body)
        .save();
      container.remove();
      toast.success('Certificate downloaded as PDF!');
    } catch (err) {
      toast.error(err.message || 'Failed to download PDF');
      console.error('PDF download error:', err);
    } finally {
      setDownloading(null);
      const el = document.getElementById('cert-renderer');
      if (el) el.remove();
    }
  }, []);

  /* ── Download via print (fallback) ── */
  const handleDownloadPrint = useCallback(async (cert) => {
    try {
      const data = await api.getCertificate(cert.roleId, cert.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      if (!html) { toast.error('No certificate content available'); return; }

      const prepared = await prepareHtml(html);
      const printHtml = prepared.replace(
        '</head>',
        `<style>@media print{body{background:#fff!important;padding:0!important;margin:0!important;min-height:auto!important;display:block!important;justify-content:unset!important;align-items:unset!important;}.certificate{box-shadow:none!important;border-radius:0!important;margin:0 auto!important;}}</style>
        <script>window.onload=function(){document.fonts.ready.then(function(){setTimeout(function(){window.print();},500);});};</script></head>`
      );

      const blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank');
      if (!win) { toast.warning('Popup blocked. Allow popups for this site.'); URL.revokeObjectURL(blobUrl); return; }
      toast.success('Opening print dialog — select "Save as PDF" to download.');
    } catch (err) {
      toast.error(err.message || 'Failed to prepare certificate');
    }
  }, []);

  const filtered = certificates.filter(c =>
    c.roleName?.toLowerCase().includes(search.toLowerCase()) ||
    c.roleId?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-5 bg-white dark:bg-black min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
            <Award className="w-3 h-3" /> Certificates
          </span>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Issued Certificates</h1>
          <p className="mt-4 text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg font-normal">
            Browse and download verified certificates issued by NexoraMind Tech.
          </p>
        </motion.div>

        {!isAuthenticated && !loading && (
          <div className="text-center py-16">
            <Award className="w-12 h-12 text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-white/40 text-sm mb-4">Please log in to view your certificates.</p>
            <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all">
              Log In
            </Link>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-white/40 text-sm">Loading certificates...</p>
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
                  placeholder="Search by role, certificate ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
              {filtered.map((cert, i) => (
                <motion.div
                  key={cert.certificateId || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-2xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    {cert.status && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                        <Shield className="w-3 h-3" /> {cert.status}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{cert.roleName}</h3>
                  <p className="text-sm text-slate-500 dark:text-white/40 mb-3">{cert.durationDisplay || formatDuration(cert.duration)}</p>

                  {cert.dateRange && (
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-white/30 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{cert.dateRange}</span>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 dark:text-white/20 font-mono mb-4">{cert.certificateId}</p>

                  <div className="flex-1" />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(cert)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-white/50 text-xs font-medium hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => setDownloadModal(cert)}
                      disabled={downloading === cert.certificateId + '_png' || downloading === cert.certificateId + '_pdf'}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-white/50 text-xs font-medium hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-200 dark:hover:border-primary-500/20 hover:text-primary-600 dark:hover:text-primary-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading === cert.certificateId + '_png' || downloading === cert.certificateId + '_pdf' ? (
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
                <Award className="w-12 h-12 text-slate-200 dark:text-white/10 mx-auto mb-4" />
                <p className="text-slate-400 dark:text-white/30 text-sm">No certificates found.</p>
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Certificate — {viewing.roleName}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPNG(viewing)}
                    disabled={!!downloading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] text-xs font-medium text-slate-600 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all disabled:opacity-50"
                  >
                    <Image className="w-3.5 h-3.5" /> PNG
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(viewing)}
                    disabled={!!downloading}
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
                  <iframe srcDoc={renderedHtml} title="Certificate" className="w-full h-full border-0" />
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
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Download Certificate</h3>
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