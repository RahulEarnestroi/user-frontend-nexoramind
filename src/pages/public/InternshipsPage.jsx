import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Clock, MapPin, DollarSign, ChevronRight, Building2, Zap } from 'lucide-react';
import { internships } from '../../data/mockData';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function InternshipsPage() {
  return (
    <div className="py-20 bg-white dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
            <Briefcase className="w-3 h-3" /> Internships
          </span>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Internship Opportunities</h1>
          <p className="mt-4 text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg font-normal">
            Launch your tech career with hands-on internship positions at NexoraMind Tech.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {internships.map((internship, i) => (
            <motion.div key={internship.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}>
              <Card hover className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-2xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <Badge variant="success">{internship.status}</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{internship.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-slate-400 dark:text-white/30" />
                  <span className="text-sm text-slate-500 dark:text-white/40">{internship.company}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-white/40 leading-relaxed mb-4 flex-1 font-normal">{internship.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 dark:text-white/30 mb-4">
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {internship.duration}</div>
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {internship.location}</div>
                  <div className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {internship.stipend}</div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {internship.requirements.map(req => (
                    <span key={req} className="px-2 py-0.5 bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/50 rounded-md text-xs font-medium border border-slate-200 dark:border-white/[0.06]">{req}</span>
                  ))}
                </div>
                <Link to={`/internships/${internship.id}`}>
                  <Button variant="primary" className="w-full">View Details <ChevronRight className="w-4 h-4" /></Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
