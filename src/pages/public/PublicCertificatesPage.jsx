import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Download, Search, Calendar, QrCode, ExternalLink, Shield, CheckCircle2 } from 'lucide-react';
import { certificates } from '../../data/mockData';

export default function PublicCertificatesPage() {
  const [search, setSearch] = useState('');

  const filtered = certificates.filter(c =>
    c.studentName.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateId.toLowerCase().includes(search.toLowerCase()) ||
    c.certificationName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-20 bg-white dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
            <Award className="w-3 h-3" /> Certificates
          </span>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Issued Certificates</h1>
          <p className="mt-4 text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg font-normal">
            Browse and download verified certificates issued by NexoraMind Tech.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by name, certificate ID, or certification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </motion.div>

        {/* Certificate Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filtered.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all group flex flex-col"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-2xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary-400" />
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  cert.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {cert.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  {cert.status}
                </span>
              </div>

              {/* Info */}
              <h3 className="text-sm font-bold text-white mb-1 tracking-tight">{cert.certificationName}</h3>
              <p className="text-sm text-white/40 mb-3">{cert.studentName}</p>

              {/* Details */}
              <div className="flex items-center gap-3 text-xs text-white/30 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(cert.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <span className="text-white/10">·</span>
                <span>Score: {cert.score}%</span>
              </div>

              {/* Certificate ID */}
              <p className="text-xs text-white/20 font-mono mb-4">{cert.certificateId}</p>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Actions */}
              <div className="flex gap-2">
                <Link to={`/verify/${cert.certificateId}`} className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs font-medium hover:bg-white/[0.08] hover:text-white/70 transition-all">
                    <QrCode className="w-3.5 h-3.5" /> Verify
                  </button>
                </Link>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-xs font-medium hover:bg-primary-500/10 hover:border-primary-500/20 hover:text-primary-400 transition-all">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Award className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">No certificates found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
