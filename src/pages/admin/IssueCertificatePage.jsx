import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, QrCode, FileCheck, CheckCircle, Copy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { certifications, certificates, nextCertNumber } from '../../data/mockData';
import { formatDate, getVerificationUrl, copyToClipboard, generateCertificateId } from '../../lib/utils';

const schema = z.object({
  studentName: z.string().min(2),
  studentEmail: z.string().email(),
  certificationId: z.string().min(1),
  score: z.number().min(0).max(100),
  completionDate: z.string().min(1),
  expiryDate: z.string().optional(),
});

export default function IssueCertificatePage() {
  const [step, setStep] = useState('form');
  const [issuedCert, setIssuedCert] = useState(null);
  const [copied, setCopied] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const score = watch('score');
  const certId = watch('certificationId');
  const selectedCert = certifications.find(c => c.id === certId);

  const onSubmit = (data) => {
    const certificateId = generateCertificateId();
    const verificationUrl = getVerificationUrl(certificateId);
    const certification = certifications.find(c => c.id === data.certificationId);

    const newCert = {
      id: 'cert' + Date.now(),
      certificateId,
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      certificationId: data.certificationId,
      certificationName: certification?.name || '',
      certificationSlug: certification?.slug || '',
      templateId: 't1',
      score: Number(data.score),
      issueDate: new Date().toISOString(),
      expiryDate: data.expiryDate || null,
      status: 'ACTIVE',
      verificationCount: 0,
      createdAt: new Date().toISOString(),
    };

    certificates.unshift(newCert);
    setIssuedCert({ ...newCert, verificationUrl });
    setStep('success');
  };

  const handleCopy = async () => {
    await copyToClipboard(issuedCert.verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-success-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-success-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Certificate Issued Successfully!</h2>
            <p className="text-slate-600 mb-6">The certificate has been generated and is ready.</p>

            <div className="p-6 bg-primary-50 rounded-xl mb-6">
              <p className="text-sm text-slate-500 mb-1">Certificate ID</p>
              <p className="text-2xl font-bold font-mono text-primary-700">{issuedCert.certificateId}</p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <QRCodeSVG value={issuedCert.verificationUrl} size={120} />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={handleCopy}>
                <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Verification Link'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/admin/certificates')}>
                View All Certificates
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Issue Certificate</h1>
        <p className="text-slate-600 mt-1">Create and issue a new certificate</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Student Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Student Name"
              placeholder="John Doe"
              error={errors.studentName?.message}
              {...register('studentName', { required: 'Name is required' })}
            />
            <Input
              label="Student Email"
              type="email"
              placeholder="john@example.com"
              error={errors.studentEmail?.message}
              {...register('studentEmail', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Certification Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Certification"
              error={errors.certificationId?.message}
              {...register('certificationId', { required: 'Certification is required' })}
            >
              <option value="">Select certification</option>
              {certifications.filter(c => c.status === 'ACTIVE').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            <Input
              label="Score (%)"
              type="number"
              min="0"
              max="100"
              placeholder="92"
              error={errors.score?.message}
              {...register('score', { required: 'Score is required', min: { value: 0 }, max: { value: 100 } })}
            />
            <Input
              label="Completion Date"
              type="date"
              error={errors.completionDate?.message}
              {...register('completionDate', { required: 'Date is required' })}
            />
            <Input
              label="Expiry Date (optional)"
              type="date"
              {...register('expiryDate')}
            />
          </div>
        </Card>

        {/* Preview */}
        {selectedCert && score && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary-600" /> Certificate Preview
              </h3>
              <div className="border-2 border-dashed border-primary-200 rounded-xl p-6 text-center bg-gradient-to-br from-primary-50/50 to-purple-50/50">
                <p className="text-xs text-slate-500 tracking-wider uppercase mb-2">Certificate of Achievement</p>
                <p className="text-xs text-slate-500 mb-1">This certifies that</p>
                <p className="text-2xl font-bold text-slate-900">{watch('studentName') || 'Student Name'}</p>
                <p className="text-xs text-slate-500 mt-2">has successfully completed</p>
                <p className="text-base font-semibold text-primary-600 mt-1">{selectedCert.name}</p>
                <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
                  <div><span className="block font-medium text-slate-700">Score</span>{score}%</div>
                  <div><span className="block font-medium text-slate-700">Issue Date</span>{formatDate(new Date().toISOString())}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <Button type="submit" size="lg" className="w-full">
          <Award className="w-5 h-5" /> Issue Certificate
        </Button>
      </form>
    </div>
  );
}
