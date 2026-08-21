import { motion } from 'framer-motion';
import { Award, Download, Eye, Share2, BookOpen, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { certificates } from '../../data/mockData';
import { formatDateShort, getVerificationUrl, copyToClipboard } from '../../lib/utils';
import { useState } from 'react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [copiedId, setCopiedId] = useState(null);

  const myCerts = certificates.filter(c => c.studentId === user?.id);
  const activeCerts = myCerts.filter(c => c.status === 'ACTIVE');
  const avgScore = myCerts.length ? Math.round(myCerts.reduce((a, c) => a + c.score, 0) / myCerts.length) : 0;

  const handleCopy = async (id) => {
    await copyToClipboard(getVerificationUrl(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="text-slate-600 mt-1">Your certification dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Certificates Earned', value: myCerts.length, icon: Award, color: 'bg-primary-100 text-primary-600' },
          { label: 'Active Certificates', value: activeCerts.length, icon: BookOpen, color: 'bg-success-50 text-success-600' },
          { label: 'Average Score', value: avgScore + '%', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Certificates */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Certificates</h2>
        {myCerts.length === 0 ? (
          <Card className="p-8 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No certificates yet.</p>
            <Link to="/certifications" className="mt-3 inline-block">
              <Button variant="secondary" size="sm">Browse Certifications</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {myCerts.map((cert, i) => (
              <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={cert.status === 'ACTIVE' ? 'success' : 'danger'}>{cert.status}</Badge>
                    <span className="text-sm font-bold text-primary-600">{cert.score}%</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{cert.certificationName}</h3>
                  <p className="text-sm text-slate-500 mb-1">Issued: {formatDateShort(cert.issueDate)}</p>
                  <p className="text-xs text-slate-400 font-mono mb-3">{cert.certificateId}</p>
                  <div className="flex gap-2">
                    <Link to={`/verify/${cert.certificateId}`} target="_blank">
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /> View</Button>
                    </Link>
                    <Button variant="ghost" size="sm"><Download className="w-4 h-4" /> Download</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(cert.certificateId)}>
                      <Share2 className="w-4 h-4" /> {copiedId === cert.certificateId ? 'Copied!' : 'Share'}
                    </Button>
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
