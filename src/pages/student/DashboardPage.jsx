import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Eye, Share2, BookOpen, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { certificates } from '../../data/mockData';
import { formatDateShort, getVerificationUrl, copyToClipboard } from '../../lib/utils';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [copiedId, setCopiedId] = useState(null);

  const myCerts = certificates.filter(c => c.studentId === user?.id);
  const activeCerts = myCerts.filter(c => c.status === 'ACTIVE');
  const avgScore = myCerts.length ? Math.round(myCerts.reduce((a, c) => a + c.score, 0) / myCerts.length) : 0;

  const handleCopy = async (id) => { await copyToClipboard(getVerificationUrl(id)); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="text-slate-500 dark:text-white/40 mt-1 font-normal">Your certification dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Certificates Earned', value: myCerts.length, icon: Award, gradient: 'from-primary-500/15 to-secondary-500/15', iconColor: 'text-primary-600 dark:text-primary-400' },
          { label: 'Active Certificates', value: activeCerts.length, icon: BookOpen, gradient: 'from-emerald-500/15 to-emerald-500/5', iconColor: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Average Score', value: avgScore + '%', icon: TrendingUp, gradient: 'from-purple-500/15 to-purple-500/5', iconColor: 'text-purple-600 dark:text-purple-400' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
              <p className="text-sm text-slate-500 dark:text-white/40">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 tracking-tight">Your Certificates</h2>
        {myCerts.length === 0 ? (
          <Card className="p-8 text-center">
            <Award className="w-12 h-12 text-slate-300 dark:text-white/15 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-white/40">No certificates yet.</p>
            <Link to="/certifications" className="mt-3 inline-block"><Button variant="secondary" size="sm">Browse Certifications</Button></Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {myCerts.map((cert, i) => (
              <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={cert.status === 'ACTIVE' ? 'success' : 'danger'}>{cert.status}</Badge>
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{cert.score}%</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 tracking-tight">{cert.certificationName}</h3>
                  <p className="text-sm text-slate-400 dark:text-white/35 mb-1">Issued: {formatDateShort(cert.issueDate)}</p>
                  <p className="text-xs text-slate-400 dark:text-white/25 font-mono mb-3">{cert.certificateId}</p>
                  <div className="flex gap-2">
                    <Link to={`/verify/${cert.certificateId}`} target="_blank"><Button variant="ghost" size="sm"><Eye className="w-4 h-4" /> View</Button></Link>
                    <Button variant="ghost" size="sm"><Download className="w-4 h-4" /> Download</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(cert.certificateId)}><Share2 className="w-4 h-4" /> {copiedId === cert.certificateId ? 'Copied!' : 'Share'}</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
