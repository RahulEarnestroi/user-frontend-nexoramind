import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Download, Search, Calendar, Shield, Loader2, AlertCircle,
  X, ExternalLink, Image, FileDown,
  ArrowRight, Clock, Lock, Unlock, CreditCard, Copy, CheckCircle2,
  ChevronRight, Mail, Smartphone
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

function normalizeCert(c) {
  return {
    certificateId: c.CertificateID ?? c.certificate_id ?? '',
    userId: c.UserID ?? c.user_id ?? '',
    username: c.Username ?? c.username ?? '',
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
    price: Number(c.Price ?? c.price ?? 0) || 0,
    locked: c._locked ?? false,
  };
}

const UPI_ID = 'nexoramind@upi';
const DEFAULT_PRICE = 199;

function formatPrice(n) {
  const v = Number(n) || 0;
  return '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function upiDeepLink(amount) {
  const a = Number(amount) || 0;
  return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=NexoraMind%20Tech&am=${a.toFixed(2)}&cu=INR&tn=Certificate%20Delivery%20Fee`;
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

function renderInContainer(html, id = 'cert-renderer') {
  return new Promise((resolve) => {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = id;
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

async function capturePng(iframe) {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(iframe.contentDocument.body, {
    scale: 2, useCORS: true, allowTaint: true,
    backgroundColor: '#ffffff', width: 1100, windowWidth: 1100,
  });
  return canvas.toDataURL('image/png');
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

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

  // Payment unlock modal state
  const [unlockModal, setUnlockModal] = useState(null); // { cert, step: 'qr'|'txn'|'success' }
  const [transactionId, setTransactionId] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [copied, setCopied] = useState(false);

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
    } finally {
      setDownloading(null);
      const el = document.getElementById('cert-renderer');
      if (el) el.remove();
    }
  }, []);

  const handleDownloadPDF = useCallback(async (cert) => {
    setDownloading(cert.certificateId + '_pdf');
    try {
      const data = await api.getCertificate(cert.roleId, cert.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      if (!html) { toast.error('No certificate content available'); return; }
      const prepared = await prepareHtml(html);
      const { container, iframe } = await renderInContainer(prepared);
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set({
        margin: 0, filename: `Certificate_${cert.roleName}_${cert.duration}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', width: 1100, windowWidth: 1100 },
        jsPDF: { unit: 'px', format: [1100, 800], orientation: 'landscape' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }).from(iframe.contentDocument.body).save();
      container.remove();
      toast.success('Certificate downloaded as PDF!');
    } catch (err) {
      toast.error(err.message || 'Failed to download PDF');
    } finally {
      setDownloading(null);
      const el = document.getElementById('cert-renderer');
      if (el) el.remove();
    }
  }, []);

  const handleDownloadPrint = useCallback(async (cert) => {
    try {
      const data = await api.getCertificate(cert.roleId, cert.duration);
      const html = data.RenderedHTML ?? data.renderedHTML ?? data.rendered_html ?? data.html ?? '';
      if (!html) { toast.error('No certificate content available'); return; }
      const prepared = await prepareHtml(html);
      const printHtml = prepared.replace('</head>',
        `<style>@media print{body{background:#fff!important;padding:0!important;margin:0!important;min-height:auto!important;display:block!important;justify-content:unset!important;align-items:unset!important;}.certificate{box-shadow:none!important;border-radius:0!important;margin:0 auto!important;}}</style>
        <script>window.onload=function(){document.fonts.ready.then(function(){setTimeout(function(){window.print();},500);});};</script></head>`
      );
      const blob = new Blob([printHtml], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank');
      if (!win) { toast.warning('Popup blocked. Allow popups for this site.'); URL.revokeObjectURL(blobUrl); return; }
      toast.success('Opening print dialog — select "Save as PDF" to download.');
    } catch (err) { toast.error(err.message || 'Failed to prepare certificate'); }
  }, []);

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast.success('UPI ID copied!');
    } catch (_) {
      toast.error('Could not copy — paste manually');
    }
  };

  const openUnlockModal = (cert) => {
    setUnlockModal({ cert, step: 'qr' });
    setTransactionId('');
    setSubmittingPayment(false);
  };
  const closeUnlockModal = () => { setUnlockModal(null); setTransactionId(''); };

  const handleSubmitPayment = async () => {
    if (!transactionId.trim()) { toast.warning('Enter the Transaction ID from your payment app'); return; }
    const cert = unlockModal?.cert;
    if (!cert) return;
    setSubmittingPayment(true);
    try {
      await api.submitCertificatePayment(cert.certificateId, transactionId.trim());
      setUnlockModal({ cert, step: 'success' });
    } catch (err) {
      toast.error(err.message || 'Failed to submit payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const filtered = certificates.filter(c =>
    c.roleName?.toLowerCase().includes(search.toLowerCase()) ||
    c.roleId?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateId?.toLowerCase().includes(search.toLowerCase())
  );

  const isNonDeliverable = (cert) => {
    if (!cert.status) return false;
    const s = String(cert.status).toUpperCase();
    return s === 'NON_DELIVERABLE' || s === 'NON DELIVERABLE' || s === 'UNDERLIVERY' || s === 'LOCKED';
  };

  const nonDelCount = certificates.filter(isNonDeliverable).length;

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
              <Award className="w-3.5 h-3.5" /> Verified Documents
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">Certificates</h1>
            <p className="text-white/50 max-w-xl mx-auto text-base font-normal">Browse and download verified certificates issued by NexoraMind Tech.</p>

            {/* Stats Row */}
            {!loading && certificates.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.1] backdrop-blur-sm border border-white/[0.1]">
                  <Award className="w-4 h-4 text-white/60" />
                  <span className="text-sm font-bold text-white">{certificates.length}</span>
                  <span className="text-xs text-white/40">Total</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.1] backdrop-blur-sm border border-white/[0.1]">
                  <Shield className="w-4 h-4 text-emerald-300" />
                  <span className="text-sm font-bold text-emerald-300">{Math.max(0, certificates.length - nonDelCount)}</span>
                  <span className="text-xs text-white/40">Delivered</span>
                </div>
                {nonDelCount > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 backdrop-blur-sm border border-amber-400/20">
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span className="text-sm font-bold text-amber-300">{nonDelCount}</span>
                    <span className="text-xs text-amber-200/60">Locked</span>
                  </div>
                )}
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
              <Award className="w-8 h-8 text-slate-300 dark:text-white/20" />
            </div>
            <p className="text-slate-500 dark:text-white/40 text-sm mb-5">Please log in to view your certificates.</p>
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
            <p className="text-slate-400 dark:text-white/30 text-sm mt-4 font-medium">Loading certificates...</p>
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
              {filtered.map((cert, i) => {
                const locked = isNonDeliverable(cert);
                return (
                  <motion.div
                    key={cert.certificateId || i}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className={`group relative bg-white dark:bg-white/[0.02] rounded-2xl border ${locked ? 'border-amber-200/70 dark:border-amber-500/20' : 'border-slate-200 dark:border-white/[0.06] hover:border-primary-200 dark:hover:border-primary-500/20'} shadow-sm hover:shadow-lg ${locked ? 'hover:shadow-amber-500/10' : 'hover:shadow-primary-500/5'} transition-all duration-300 overflow-hidden flex flex-col`}
                  >
                    {/* Locked banner */}
                    {locked && (
                      <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0 8px, transparent 8px 16px)' }} />
                        <div className="relative px-6 py-2 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-wide uppercase">
                            <Lock className="w-3 h-3" /> Delivery Locked
                          </span>
                          <span className="text-[10px] font-bold opacity-90">Payment required</span>
                        </div>
                      </div>
                    )}

                    {/* Top accent */}
                    {!locked && <div className="h-1 w-full bg-gradient-to-r from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}

                    <div className="p-6 flex flex-col flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl ${locked ? 'bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-200/60 dark:border-amber-500/15' : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/50 dark:border-amber-500/10'} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                          {locked ? (
                            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          )}
                        </div>
                        {cert.status && (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${locked ? 'bg-amber-50 dark:bg-amber-500/[0.08] text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20' : 'bg-emerald-50 dark:bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/15'}`}>
                            {locked ? <Lock className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                            {locked ? 'Locked' : cert.status}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className={`text-lg font-bold mb-1 tracking-tight group-hover:${locked ? 'text-amber-700 dark:group-hover:text-amber-400' : 'text-primary-600 dark:group-hover:text-primary-400'} transition-colors ${locked ? 'text-slate-800 dark:text-white' : 'text-slate-900 dark:text-white'}`}>{cert.roleName}</h3>

                      {/* Duration + Date */}
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-3.5 h-3.5 text-slate-400 dark:text-white/25" />
                        <span className="text-sm text-slate-500 dark:text-white/40 font-medium">{cert.durationDisplay || formatDuration(cert.duration)}</span>
                        {cert.dateRange && (
                          <>
                            <span className="text-slate-200 dark:text-white/10">|</span>
                            <Calendar className="w-3.5 h-3.5 text-slate-300 dark:text-white/20" />
                            <span className="text-xs text-slate-400 dark:text-white/30">{cert.dateRange}</span>
                          </>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-white/[0.04]">
                        <span className="text-[10px] text-slate-400 dark:text-white/20 font-mono tracking-wide">{cert.certificateId}</span>
                        {cert.issuedAt && (
                          <span className="text-[11px] text-slate-400 dark:text-white/25 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      {locked ? (
                        <div className="mt-auto">
                          <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/[0.06] dark:to-orange-500/[0.04] border border-amber-200/50 dark:border-amber-500/15 mb-3">
                            <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                              <CreditCard className="w-3 h-3" /> One-time Delivery Fee
                            </p>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xl font-extrabold tracking-tight text-amber-900 dark:text-amber-200">{formatPrice(cert.price || DEFAULT_PRICE)}</span>
                                <span className="text-[10px] font-semibold text-amber-700/70 dark:text-amber-300/70 ml-1">via UPI</span>
                              </div>
                              <span className="text-[10px] font-bold text-amber-600/80 dark:text-amber-300/80 flex items-center gap-1">
                                <Mail className="w-2.5 h-2.5" /> Delivered to Email
                              </span>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openUnlockModal(cert)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-xs font-black shadow-sm shadow-amber-500/25 hover:shadow-md hover:shadow-amber-500/35 transition-all tracking-wide"
                          >
                            <Unlock className="w-3.5 h-3.5" /> Unlock Certificate
                          </motion.button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleView(cert)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-white/50 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.1] transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Preview
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setDownloadModal(cert)}
                            disabled={downloading === cert.certificateId + '_png' || downloading === cert.certificateId + '_pdf'}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-bold shadow-sm shadow-primary-500/15 hover:shadow-md hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloading === cert.certificateId + '_png' || downloading === cert.certificateId + '_pdf' ? (
                              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                            ) : (
                              <><Download className="w-3.5 h-3.5" /> Download</>
                            )}
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06]">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-slate-300 dark:text-white/15" />
                </div>
                <p className="text-slate-500 dark:text-white/30 text-sm font-medium">
                  {search ? 'No certificates match your search.' : 'No certificates found.'}
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
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                    <Award className="w-4 h-4 text-amber-500" />
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDownloadModal(null)}>
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden"
            >
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Download Certificate</h3>
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

      {/* ── Unlock / Payment Modal ── */}
      <AnimatePresence>
        {unlockModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeUnlockModal}>
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/[0.1] shadow-2xl overflow-hidden"
            >
              {/* Step: QR */}
              {unlockModal.step === 'qr' && (
                <>
                  {/* Header gradient */}
                  <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-white/5 blur-2xl" />
                    <div className="relative px-7 pt-7 pb-16">
                      <div className="flex items-center justify-between mb-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white/90 text-[10px] font-black tracking-wider uppercase border border-white/20 backdrop-blur-sm">
                          <Lock className="w-3 h-3" /> Unlock Certificate
                        </span>
                        <button onClick={closeUnlockModal} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <h3 className="text-2xl font-extrabold tracking-tight text-white">One-time Delivery Fee</h3>
                      <p className="text-white/60 text-sm mt-1.5 max-w-xs">{unlockModal.cert.roleName} · {formatDuration(unlockModal.cert.duration)}</p>
                      <div className="mt-5 flex items-end gap-3">
                        <span className="text-5xl font-black tracking-tight text-white leading-none">{formatPrice(unlockModal.cert.price || DEFAULT_PRICE)}</span>
                        <span className="text-[11px] font-bold text-white/70 mb-2 pb-0.5">via UPI / GPay / PhonePe / Paytm</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-7 pb-7 -mt-10">
                    {/* QR card */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, type: 'spring' }}
                      className="bg-white dark:bg-white/[0.04] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xl shadow-primary-500/10 p-5"
                    >
                      {/* QR + amount frame */}
                      <div className="relative">
                        <div className="w-full aspect-square max-w-[260px] mx-auto rounded-2xl border-2 border-slate-200 dark:border-white/[0.08] p-3 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=10&data=${encodeURIComponent(upiDeepLink(unlockModal.cert.price || DEFAULT_PRICE))}`}
                            alt="Scan to pay via UPI"
                            className="w-full h-full object-contain rounded-xl"
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                          />
                          <div className="hidden text-center">
                            <Smartphone className="w-10 h-10 text-primary-400 mx-auto mb-2" />
                            <p className="text-[11px] text-slate-500 dark:text-white/50 font-semibold">Open your UPI app and pay to the ID below</p>
                          </div>
                          {/* Nexora center badge */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-white/[0.1] flex items-center justify-center">
                            <span className="text-[10px] font-black tracking-tighter text-primary-600 dark:text-primary-400">{formatPrice(unlockModal.cert.price || DEFAULT_PRICE)}</span>
                          </div>
                        </div>

                        {/* Corner decorations */}
                        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary-500 rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary-500 rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary-500 rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary-500 rounded-br-xl" />
                      </div>

                      {/* Scan tip */}
                      <div className="mt-5 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-white/[0.03] dark:to-white/[0.01] border border-slate-200 dark:border-white/[0.05]">
                        <Smartphone className="w-4 h-4 text-primary-500 shrink-0" />
                        <p className="text-[11px] font-semibold text-slate-600 dark:text-white/60 leading-snug">
                          Scan QR with any UPI app · GPay, PhonePe, Paytm, BHIM
                        </p>
                      </div>
                    </motion.div>

                    {/* UPI ID */}
                    <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider mb-1.5 px-0.5">Or pay to UPI ID</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] flex items-center gap-2.5">
                          <CreditCard className="w-4 h-4 text-primary-500 shrink-0" />
                          <code className="font-mono text-sm font-bold text-slate-800 dark:text-white/80 tracking-wide flex-1">{UPI_ID}</code>
                        </div>
                        <button
                          onClick={handleCopyUpi}
                          className={`px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${copied ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' : 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-500/20 hover:bg-primary-100 dark:hover:bg-primary-500/15'}`}
                        >
                          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Next */}
                    <motion.button
                      initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setUnlockModal({ ...unlockModal, step: 'txn' })}
                      className="w-full mt-5 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white text-sm font-bold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/35 transition-all"
                    >
                      I've Paid {formatPrice(unlockModal.cert.price || DEFAULT_PRICE)} <ChevronRight className="w-4 h-4" />
                    </motion.button>
                    <p className="mt-3 text-center text-[10.5px] font-semibold text-slate-400 dark:text-white/30">
                      Keep your Transaction ID handy for the next step
                    </p>
                  </div>
                </>
              )}

              {/* Step: Transaction ID */}
              {unlockModal.step === 'txn' && (
                <>
                  {/* Header */}
                  <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-white/5 blur-2xl" />
                    <div className="relative px-7 pt-7 pb-8">
                      <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setUnlockModal({ ...unlockModal, step: 'qr' })} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-white/90 text-[10px] font-bold tracking-wider uppercase border border-white/20 backdrop-blur-sm hover:bg-white/25 transition-colors">
                          <ChevronRight className="w-3 h-3 rotate-180" /> Back
                        </button>
                        <button onClick={closeUnlockModal} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-white/30 border-2 border-white/80 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 h-0.5 bg-white/25 rounded-full overflow-hidden">
                          <div className="w-1/2 h-full bg-white" />
                        </div>
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
                          <span className="text-[11px] font-black text-emerald-600">2</span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-extrabold tracking-tight text-white">Enter Transaction ID</h3>
                      <p className="text-white/70 text-sm mt-1.5 max-w-xs">Find this in your UPI app under payment history</p>
                    </div>
                  </div>

                  <div className="px-7 pb-7 -mt-2">
                    <motion.div
                      initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, type: 'spring' }}
                      className="bg-white dark:bg-white/[0.04] rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-xl shadow-emerald-500/10 p-5 relative z-10"
                    >
                      <label className="block text-xs font-bold text-slate-600 dark:text-white/60 mb-2 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> UPI Transaction ID / Reference No.
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value.trim())}
                        placeholder="e.g. 312345678901 or UPI1234567890ABC"
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border-2 border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm font-mono font-bold tracking-wide placeholder:text-slate-400 dark:placeholder:text-white/25 focus:outline-none focus:border-emerald-400/60 dark:focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                      <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/[0.06] border border-amber-200/60 dark:border-amber-500/15">
                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <div className="text-[11px] leading-relaxed">
                          <p className="font-bold text-amber-800 dark:text-amber-300 mb-0.5">Before submitting</p>
                          <p className="text-amber-700/80 dark:text-amber-300/70">Verify that <b>{formatPrice(unlockModal.cert.price || DEFAULT_PRICE)}</b> was debited from your account to <b>{UPI_ID}</b>. Wrong transaction IDs will delay delivery.</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.button
                      initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitPayment}
                      disabled={submittingPayment || !transactionId.trim()}
                      className="w-full mt-5 flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingPayment ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Submit & Request Delivery</>
                      )}
                    </motion.button>
                  </div>
                </>
              )}

              {/* Step: Success */}
              {unlockModal.step === 'success' && (
                <>
                  <div className="relative px-7 pt-10 pb-6 flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 }}
                      className="relative mb-5"
                    >
                      <div className="absolute inset-0 -m-6 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
                      <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                        <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                      </div>
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white text-center"
                    >
                      Payment Submitted!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                      className="text-sm text-slate-500 dark:text-white/50 mt-2 text-center max-w-xs"
                    >
                      Our team is verifying your payment. The certificate will be delivered shortly.
                    </motion.p>
                  </div>

                  <div className="px-7 pb-7">
                    <motion.div
                      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
                      className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/[0.06] dark:to-teal-500/[0.04] border border-emerald-200/60 dark:border-emerald-500/15"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">Certificate to Email</p>
                          <p className="text-[11px] text-emerald-700/70 dark:text-emerald-300/70 font-medium">You'll receive it at your registered email</p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 text-[11.5px] text-slate-700 dark:text-white/60">
                          <Clock className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                          <span className="font-semibold">Expected delivery within 30 minutes (working hours)</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11.5px] text-slate-700 dark:text-white/60">
                          <Award className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                          <span className="font-semibold">High-res PDF + PNG will be attached</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11.5px] text-slate-700 dark:text-white/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-semibold">Also appears in this dashboard once processed</span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                      onClick={closeUnlockModal}
                      className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-white/90 transition-all"
                    >
                      Got it, close
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
