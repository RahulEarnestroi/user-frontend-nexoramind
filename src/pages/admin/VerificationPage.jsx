import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { certificates } from '../../data/mockData';
import { formatDate } from '../../lib/utils';

export default function VerificationPage() {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    setSearched(true);
    const found = certificates.find(c => c.certificateId === certId.trim());
    setResult(found || null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Certificate Verification</h1>
        <p className="text-slate-600 mt-1">Verify a certificate by its ID</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleVerify} className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Enter certificate ID (e.g. RC-2026-000184)"
              value={certId}
              onChange={e => setCertId(e.target.value)}
            />
          </div>
          <Button type="submit"><Search className="w-4 h-4" /> Verify</Button>
        </form>
      </Card>

      {searched && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {result ? (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${result.status === 'ACTIVE' ? 'bg-success-50' : 'bg-danger-50'}`}>
                  {result.status === 'ACTIVE' ? <CheckCircle className="w-6 h-6 text-success-500" /> : <XCircle className="w-6 h-6 text-danger-500" />}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${result.status === 'ACTIVE' ? 'text-success-700' : 'text-danger-700'}`}>
                    {result.status === 'ACTIVE' ? 'Certificate Valid' : 'Certificate Revoked'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {result.status === 'ACTIVE' ? 'This certificate is authentic.' : 'This certificate is no longer valid.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Certificate ID</p>
                  <p className="font-mono font-semibold text-slate-900">{result.certificateId}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Student</p>
                  <p className="font-medium text-slate-900">{result.studentName}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Certification</p>
                  <p className="font-medium text-slate-900">{result.certificationName}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Score</p>
                  <p className="font-medium text-slate-900">{result.score}%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Issue Date</p>
                  <p className="font-medium text-slate-900">{formatDate(result.issueDate)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Status</p>
                  <Badge variant={result.status === 'ACTIVE' ? 'success' : 'danger'}>{result.status}</Badge>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <XCircle className="w-12 h-12 text-danger-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Certificate Not Found</h3>
              <p className="text-slate-600">No certificate found with ID: {certId}</p>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
