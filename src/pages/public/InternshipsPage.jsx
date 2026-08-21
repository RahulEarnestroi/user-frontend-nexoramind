import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Clock, MapPin, DollarSign, ChevronRight, Building2, Zap } from 'lucide-react';
import { internships } from '../../data/mockData';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function InternshipsPage() {
  return (
    <div className="py-20 bg-gradient-subtle min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold mb-4 border border-primary-100">
            <Briefcase className="w-3 h-3" /> Internships
          </span>
          <h1 className="text-4xl font-bold text-slate-900">Internship Opportunities</h1>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-lg">
            Launch your tech career with hands-on internship positions at NexoraMind Tech.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {internships.map((internship, i) => (
            <motion.div
              key={internship.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card hover className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-primary-50 rounded-2xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary-600" />
                  </div>
                  <Badge variant="success">{internship.status}</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{internship.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">{internship.company}</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{internship.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {internship.duration}</div>
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {internship.location}</div>
                  <div className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {internship.stipend}</div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {internship.requirements.map(req => (
                    <span key={req} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">{req}</span>
                  ))}
                </div>
                <Link to={`/internships/${internship.id}`}>
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
