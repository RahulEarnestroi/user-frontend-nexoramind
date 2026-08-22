import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Download, Share2, Copy, ArrowLeft, Calendar, Hash, Shield, Building2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { certificates } from '../../data/mockData';
import { formatDate, getVerificationUrl, copyToClipboard } from '../../lib/utils';
import { useState } from 'react';

export default function StudentCertificateDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const cert = certificates.find(c => c.id === id && c.studentId === user?.id);

  const handleCopy = async () => {
    await copyToClipboard(getVerificationUrl(cert.certificateId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!cert) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Certificate not found</h1>
        <Link to="/student/certificates" className="mt-4 inline-block text-primary-400 hover:underline">Back to certificates</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/student/certificates" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to certificates
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Certificate Preview */}
        <Card className="p-8 mb-6">
          <div className="border-2 border-dashed border-primary-500/20 rounded-xl p-8 text-center bg-white/[0.02]">
            <p className="text-xs text-white/40 tracking-wider uppercase mb-2 font-medium">Certificate of Achievement</p>
            <p className="text-xs text-white/30 mb-1">This certifies that</p>
            <p className="text-3xl font-bold text-white my-2 tracking-tight">{cert.studentName}</p>
            <p className="text-xs text-white/30">has successfully completed</p>
            <p className="text-lg font-semibold text-primary-400 mt-1">{cert.certificationName}</p>
            <div className="mt-6 flex items-center justify-center gap-8 text-xs text-white/30">
              <div><span className="block font-medium text-white/50">Score</span>{cert.score}%</div>
              <div><span className="block font-medium text-white/50">Issue Date</span>{formatDate(cert.issueDate)}</div>
              <div><span className="block font-medium text-white/50">Certificate ID</span>{cert.certificateId}</div>
            </div>
            <div className="mt-4 flex justify-center">
              <QRCodeSVG value={getVerificationUrl(cert.certificateId)} size={80} bgColor="transparent" fgColor="rgba(255,255,255,0.6)" />
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-white mb-4 tracking-tight">Certificate Details</h3>
          <div className="space-y-3">
            {[
              { icon: Hash, label: 'Certificate ID', value: cert.certificateId, mono: true },
              { icon: Award, label: 'Certification', value: cert.certificationName },
              { icon: Calendar, label: 'Issued', value: formatDate(cert.issueDate) },
              { icon: Building2, label: 'Score', value: cert.score + '%' },
              { icon: Shield, label: 'Status', value: cert.status },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.06] last:border-0">
                <item.icon className="w-4 h-4 text-white/30" />
                <span className="text-sm text-white/40 w-32">{item.label}</span>
                <span className={`text-sm font-medium text-white ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleCopy}>
            <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Verification Link'}
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4" /> Download Certificate
          </Button>
          <Button variant="secondary">
            <Share2 className="w-4 h-4" /> Share
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
