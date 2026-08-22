import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Building2, Search, ChevronDown, Briefcase, CheckCircle2 } from 'lucide-react';

const offerLetters = [
  {
    id: 'ol1',
    title: 'Frontend Development Intern',
    studentName: 'John Doe',
    company: 'NexoraMind Tech',
    duration: '3 Months',
    startDate: '01 July 2026',
    endDate: '01 October 2026',
    stipend: 'Paid',
    offerDate: '25 June 2026',
    offerId: 'NM-OL-2026-00412',
    status: 'Active',
    type: 'Full-time',
  },
  {
    id: 'ol2',
    title: 'Backend Development Intern',
    studentName: 'Sarah Wilson',
    company: 'NexoraMind Tech',
    duration: '3 Months',
    startDate: '15 July 2026',
    endDate: '15 October 2026',
    stipend: 'Paid',
    offerDate: '10 July 2026',
    offerId: 'NM-OL-2026-00413',
    status: 'Active',
    type: 'Full-time',
  },
  {
    id: 'ol3',
    title: 'UI/UX Design Intern',
    studentName: 'Rahul Kumar',
    company: 'NexoraMind Tech',
    duration: '2 Months',
    startDate: '01 August 2026',
    endDate: '01 October 2026',
    stipend: 'Paid',
    offerDate: '28 July 2026',
    offerId: 'NM-OL-2026-00414',
    status: 'Active',
    type: 'Part-time',
  },
  {
    id: 'ol4',
    title: 'Data Science Intern',
    studentName: 'Priya Sharma',
    company: 'NexoraMind Tech',
    duration: '3 Months',
    startDate: '10 August 2026',
    endDate: '10 November 2026',
    stipend: 'Paid',
    offerDate: '05 August 2026',
    offerId: 'NM-OL-2026-00415',
    status: 'Active',
    type: 'Full-time',
  },
];

export default function OfferLettersPage() {
  const [search, setSearch] = useState('');

  const filtered = offerLetters.filter(ol =>
    ol.title.toLowerCase().includes(search.toLowerCase()) ||
    ol.studentName.toLowerCase().includes(search.toLowerCase()) ||
    ol.offerId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-20 bg-white dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
            <FileText className="w-3 h-3" /> Offer Letters
          </span>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Internship Offer Letters</h1>
          <p className="mt-4 text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg font-normal">
            View and download your official internship offer letters from NexoraMind Tech.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by name, role, or offer ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </motion.div>

        {/* Offer Letter Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {filtered.map((ol, i) => (
            <motion.div
              key={ol.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all group"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-2xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-400" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> {ol.status}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-1 tracking-tight">{ol.title}</h3>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-white/30" />
                <span className="text-sm text-white/40">{ol.studentName}</span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Calendar className="w-3.5 h-3.5 text-white/25" />
                  <span>{ol.startDate} — {ol.endDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Briefcase className="w-3.5 h-3.5 text-white/25" />
                  <span>{ol.duration} · {ol.type}</span>
                </div>
              </div>

              {/* Offer ID */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs text-white/25 font-mono">{ol.offerId}</span>
                <span className="text-xs text-white/25">Issued: {ol.offerDate}</span>
              </div>

              {/* Download Button */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-primary-500/10 hover:border-primary-500/20 hover:text-primary-400 transition-all group-hover:border-white/[0.12]">
                <Download className="w-4 h-4" /> Download Offer Letter
              </button>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">No offer letters found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
