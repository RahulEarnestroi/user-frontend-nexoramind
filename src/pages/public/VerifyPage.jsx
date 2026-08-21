import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Shield, QrCode } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

export default function VerifyPage() {
  const [certificateId, setCertificateId] = useState('');
  const [error, setError] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');
    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }
    window.location.href = `/verify/${certificateId.trim()}`;
  };

  return (
    <div className="py-20 bg-gradient-subtle min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Verify a Certificate</h1>
          <p className="mt-3 text-slate-500">Enter a certificate ID to verify its authenticity.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-8">
            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                label="Certificate ID"
                placeholder="e.g. NM-2026-000184"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                error={error}
              />
              <Button type="submit" className="w-full" size="lg">
                <Search className="w-5 h-5" /> Verify Certificate
              </Button>
            </form>
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-400 mb-3">Or scan a QR code</p>
              <div className="w-32 h-32 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <QrCode className="w-16 h-16 text-slate-200" />
              </div>
              <p className="text-xs text-slate-400 mt-2">Point your camera at the QR code on a certificate</p>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
          <Card className="p-6 bg-primary-50 border-primary-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900">How verification works</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Every NexoraMind Tech certificate has a unique ID and QR code. We check our database to confirm it was issued and is currently valid.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
