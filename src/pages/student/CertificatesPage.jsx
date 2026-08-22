import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Download, Eye, Share2, Search } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { certificates } from '../../data/mockData';
import { formatDateShort, getVerificationUrl, copyToClipboard } from '../../lib/utils';

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState('');

  const myCerts = certificates.filter(c => {
    if (c.studentId !== user?.id) return false;
    if (!search) return true;
    return c.certificationName.toLowerCase().includes(search.toLowerCase()) || c.certificateId.toLowerCase().includes(search.toLowerCase());
  });

  const handleCopy = async (id) => { await copyToClipboard(getVerificationUrl(id)); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Certificates</h1>
          <p className="text-slate-500 dark:text-white/40 mt-1">{myCerts.length} certificate(s)</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" />
        <input type="text" placeholder="Search certificates..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder:text-slate-400 dark:placeholder:text-white/30" />
      </div>

      {myCerts.length === 0 ? (
        <Card className="p-8 text-center">
          <Award className="w-12 h-12 text-slate-300 dark:text-white/15 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-white/40">No certificates found.</p>
          <Link to="/certifications" className="mt-3 inline-block"><Button variant="secondary" size="sm">Browse Certifications</Button></Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCerts.map((cert, i) => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card hover className="p-5 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <Badge variant={cert.status === 'ACTIVE' ? 'success' : 'danger'}>{cert.status}</Badge>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 tracking-tight">{cert.certificationName}</h3>
                <p className="text-sm text-slate-400 dark:text-white/35 mb-1">Score: {cert.score}%</p>
                <p className="text-sm text-slate-400 dark:text-white/35 mb-1">Issued: {formatDateShort(cert.issueDate)}</p>
                <p className="text-xs text-slate-400 dark:text-white/25 font-mono mb-4">{cert.certificateId}</p>
                <div className="mt-auto flex gap-2">
                  <Link to={`/verify/${cert.certificateId}`} target="_blank" className="flex-1"><Button variant="secondary" size="sm" className="w-full"><Eye className="w-4 h-4" /> View</Button></Link>
                  <Button variant="secondary" size="sm" className="flex-1"><Download className="w-4 h-4" /> Download</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(cert.certificateId)}><Share2 className="w-4 h-4" /></Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
