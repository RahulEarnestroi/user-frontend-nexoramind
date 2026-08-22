import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Share2, Copy, ExternalLink, Award, Calendar, Hash, User, Building2 } from 'lucide-react';
import { certificates } from '../../data/mockData';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { formatDate, getVerificationUrl, copyToClipboard } from '../../lib/utils';
import { useState } from 'react';

export default function CertificateVerifyPage() {
  const { certificateId } = useParams();
  const [copied, setCopied] = useState(false);
  const cert = certificates.find(c => c.certificateId === certificateId);
  const isRevoked = cert && cert.status === 'REVOKED';

  const handleCopy = async () => {
    await copyToClipboard(getVerificationUrl(certificateId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const url = getVerificationUrl(certificateId);
    const text = `Verify my NexoraMind Tech certificate: ${certificateId}`;
    const urls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      email: `mailto:?subject=${encodeURIComponent('Certificate Verification')}&body=${encodeURIComponent(text + '\n' + url)}`,
    };
    window.open(urls[platform], '_blank');
  };

  if (!cert) {
    return (
      <div className="py-20 bg-black min-h-screen" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Certificate Not Found</h1>
            <p className="text-white/40 mb-6 font-normal">
              Please check the certificate ID and try again.
            </p>
            <p className="text-sm text-white/30 mb-6">Certificate ID: {certificateId}</p>
            <Link to="/verify">
              <Button>Try Another ID</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-black min-h-screen" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Status Banner */}
          <div className={`rounded-xl p-6 mb-8 ${isRevoked ? 'bg-red-500/10 border border-red-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
            <div className="flex items-center gap-3">
              {isRevoked ? (
                <XCircle className="w-8 h-8 text-red-400" />
              ) : (
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              )}
              <div>
                <h2 className={`text-xl font-bold ${isRevoked ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isRevoked ? 'REVOKED' : 'VERIFIED'}
                </h2>
                <p className={`text-sm ${isRevoked ? 'text-red-400/70' : 'text-emerald-400/70'}`}>
                  {isRevoked ? 'This certificate is no longer valid.' : 'This certificate is authentic and has been issued by NexoraMind Tech.'}
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Details */}
          <Card className="p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Certificate of Achievement</p>
                <p className="font-semibold text-white">{cert.certificationName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 py-3 border-b border-white/[0.06]">
                <User className="w-5 h-5 text-white/30" />
                <div>
                  <p className="text-xs text-white/40">Student</p>
                  <p className="font-semibold text-white">{cert.studentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-white/[0.06]">
                <Hash className="w-5 h-5 text-white/30" />
                <div>
                  <p className="text-xs text-white/40">Certificate ID</p>
                  <p className="font-mono font-semibold text-white">{cert.certificateId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-white/[0.06]">
                <Calendar className="w-5 h-5 text-white/30" />
                <div>
                  <p className="text-xs text-white/40">Issued</p>
                  <p className="text-white">{formatDate(cert.issueDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-white/[0.06]">
                <Building2 className="w-5 h-5 text-white/30" />
                <div>
                  <p className="text-xs text-white/40">Score</p>
                  <p className="text-white">{cert.score}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <Shield className="w-5 h-5 text-white/30" />
                <div>
                  <p className="text-xs text-white/40">Issued by</p>
                  <p className="text-white">NexoraMind Tech</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCopy}>
              <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Verification Link'}
            </Button>
            <Button variant="secondary" onClick={() => handleShare('linkedin')}>
              <ExternalLink className="w-4 h-4" /> LinkedIn
            </Button>
            <Button variant="secondary" onClick={() => handleShare('whatsapp')}>
              <Share2 className="w-4 h-4" /> WhatsApp
            </Button>
            <Button variant="secondary" onClick={() => handleShare('email')}>
              <Share2 className="w-4 h-4" /> Email
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
