import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award, Clock, BarChart3, CheckCircle, ChevronRight, ArrowLeft,
  Target, BookOpen, ClipboardCheck, GraduationCap, Share2
} from 'lucide-react';
import { certifications } from '../../data/mockData';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const steps = [
  { icon: Target, title: 'Register', desc: 'Create your account and enroll' },
  { icon: BookOpen, title: 'Complete Assessment', desc: 'Pass the certification exam' },
  { icon: ClipboardCheck, title: 'Pass Certification', desc: 'Score above the passing threshold' },
  { icon: GraduationCap, title: 'Receive Certificate', desc: 'Get your verified certificate' },
  { icon: Share2, title: 'Share & Verify', desc: 'Share and let others verify' },
];

const faqs = [
  { q: 'How long is the certification valid?', a: 'The certification does not expire and is valid indefinitely.' },
  { q: 'Can I retake the assessment?', a: 'Yes, you can retake the assessment after 7 days if you do not pass.' },
  { q: 'How do employers verify my certificate?', a: 'Each certificate has a unique ID and QR code. Employers can verify at /verify.' },
];

export default function CertificationDetailPage() {
  const { slug } = useParams();
  const cert = certifications.find(c => c.slug === slug);

  if (!cert) {
    return (
      <div className="py-20 bg-white dark:bg-black min-h-screen text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Certification not found</h1>
        <Link to="/certifications" className="mt-4 inline-block text-primary-600 dark:text-primary-400 hover:underline">Back to certifications</Link>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white dark:bg-black min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/certifications" className="inline-flex items-center gap-1 text-sm text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to certifications
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <Badge variant="success">Active</Badge>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{cert.name}</h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-white/50 leading-relaxed max-w-3xl font-normal">{cert.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-400 dark:text-white/40">
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> Duration: {cert.duration}</div>
            <div className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> Passing Score: {cert.passingScore}%</div>
          </div>
          <div className="mt-6">
            <Link to="/login"><Button size="lg">Start Certification <ChevronRight className="w-5 h-5" /></Button></Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Skills Covered</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cert.skills.map(skill => (
              <div key={skill} className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-white/[0.03] rounded-lg border border-slate-200 dark:border-white/[0.06]">
                <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-white/70">{skill}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Certification Process</h2>
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500/20 via-primary-500/30 to-secondary-500/20" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {steps.map((step, i) => (
                <div key={i} className="relative text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-3 relative z-10 shadow-lg shadow-primary-500/25">
                    <span className="text-white font-bold text-lg">{i + 1}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight">{step.title}</h3>
                  <p className="text-xs text-slate-400 dark:text-white/30 mt-1 font-normal">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Certificate Preview</h2>
          <Card className="p-8">
            <div className="border-2 border-dashed border-primary-500/20 rounded-xl p-8 text-center bg-primary-50/50 dark:bg-white/[0.02]">
              <p className="text-xs text-slate-400 dark:text-white/40 tracking-wider uppercase mb-2 font-medium">Certificate of Achievement</p>
              <p className="text-xs text-slate-400 dark:text-white/30 mb-1">This certifies that</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white my-2 tracking-tight">Student Name</p>
              <p className="text-xs text-slate-400 dark:text-white/30">has successfully completed</p>
              <p className="text-lg font-semibold text-primary-600 dark:text-primary-400 mt-1">{cert.name}</p>
              <div className="mt-6 flex items-center justify-center gap-8 text-xs text-slate-400 dark:text-white/30">
                <div><span className="block font-medium text-slate-500 dark:text-white/50">Score</span>92%</div>
                <div><span className="block font-medium text-slate-500 dark:text-white/50">Issue Date</span>August 11, 2026</div>
                <div><span className="block font-medium text-slate-500 dark:text-white/50">Certificate ID</span>RC-2026-000184</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">FAQ</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="p-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-500 dark:text-white/40 font-normal">{faq.a}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
