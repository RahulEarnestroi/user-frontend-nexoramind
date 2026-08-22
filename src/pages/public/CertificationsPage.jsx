import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Clock, BarChart3, ChevronRight, Zap } from 'lucide-react';
import { certifications } from '../../data/mockData';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function CertificationsPage() {
  return (
    <div className="py-20 bg-white dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
            <Zap className="w-3 h-3" /> Certifications
          </span>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Certification Programs</h1>
          <p className="mt-4 text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg font-normal">
            Choose a certification program and validate your skills across multiple tech domains.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {certifications.filter(c => c.status === 'ACTIVE').map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Card hover className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-2xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{cert.name}</h3>
                <p className="text-sm text-slate-500 dark:text-white/40 leading-relaxed mb-4 flex-1 font-normal">{cert.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400 dark:text-white/30 mb-4">
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {cert.duration}</div>
                  <div className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> Pass: {cert.passingScore}%</div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {cert.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/50 rounded-md text-xs font-medium border border-slate-200 dark:border-white/[0.06]">{skill}</span>
                  ))}
                  {cert.skills.length > 4 && (
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-white/40 rounded-md text-xs border border-slate-200 dark:border-white/[0.06]">+{cert.skills.length - 4}</span>
                  )}
                </div>
                <Link to={`/certifications/${cert.slug}`}>
                  <Button variant="primary" className="w-full">
                    View Details <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
