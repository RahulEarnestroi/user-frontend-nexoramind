import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Search, Calendar, Shield, Loader2, AlertCircle, X, ExternalLink, ArrowLeft } from 'lucide-react';
import html2pdf from 'html2pdf.js';
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

export default function PublicCertificatesPage() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewing, setViewing] = useState(null);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [loadingHtml, setLoadingHtml] = useState(false);

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

  const handleDownload = useCallback(async (cert) => {
    try {
      const data = await api.getCertificate(cert.roleId, cert.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      if (!html) { toast.error('No certificate content available'); return; }
      toast.info('Generating PDF...');

      // 1. Convert Logo.png to base64 so relative paths resolve in iframe
      const logoRes = await fetch('/Logo.png');
      const logoBlob = await logoRes.blob();
      const logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(logoBlob);
      });

      // Replace all relative Logo.png references with base64 data URL
      const fixedHtml = html
        .replace(/src="Logo\.png"/g, `src="${logoBase64}"`)
        .replace(/src='Logo\.png'/g, `src='${logoBase64}'`)
        .replace(/url\(Logo\.png\)/g, `url(${logoBase64})`);

      // 2. Create blob URL so the iframe gets a proper origin (fonts, CORS work)
      const blob = new Blob([fixedHtml], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);

      // 3. Create iframe and load the blob URL
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1020px;border:none;background:transparent;';
      document.body.appendChild(iframe);
      iframe.src = blobUrl;

      // 4. Wait for iframe load + fonts
      await new Promise(r => { iframe.onload = r; });
      await new Promise(r => setTimeout(r, 2000));
      try { await iframe.contentDocument.fonts.ready; } catch {}

      // 5. Find the certificate element and capture
      const doc = iframe.contentDocument;
      const target = doc.querySelector('.certificate') || doc.body;
      if (!target) throw new Error('Certificate element not found');

      await html2pdf().set({
        margin: 0,
        filename: `Certificate-${cert.roleId}-${cert.duration}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: target.scrollWidth,
          height: target.scrollHeight,
          windowWidth: target.scrollWidth,
          windowHeight: target.scrollHeight,
        },
        jsPDF: {
          unit: 'px',
          format: [target.scrollWidth / 2, target.scrollHeight / 2],
          orientation: 'landscape',
          hotfixes: ['px_scaling'],
        },
      }).from(target).save();

      // 6. Cleanup
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(iframe);
      toast.success('Certificate PDF downloaded!');
    } catch (err) {
      toast.error(err.message || 'Failed to download certificate');
      console.error('Certificate PDF error:', err);
    }
  }, []);

  const filtered = certificates.filter(c =>
    c.roleName?.toLowerCase().includes(search.toLowerCase()) ||
    c.roleId?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-20 bg-white dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/internships" className="inline-flex items-center gap-1 text-sm text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to internships
        </Link>

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

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
                      onClick={() => handleDownload(cert)}
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
                <Award className="w-12 h-12 text-slate-200 dark:text-white/10 mx-auto mb-4" />
                <p className="text-slate-400 dark:text-white/30 text-sm">No certificates found.</p>
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Certificate — {viewing.roleName}</h3>
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
    </div>
  );
}
