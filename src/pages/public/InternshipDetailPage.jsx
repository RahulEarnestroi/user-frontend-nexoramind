import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Clock, MapPin, DollarSign, ArrowLeft,
  CheckCircle, Building2, Calendar, Users
} from 'lucide-react';
import { internships } from '../../data/mockData';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function InternshipDetailPage() {
  const { id } = useParams();
  const internship = internships.find(i => i.id === id);

  if (!internship) {
    return (
      <div className="py-20 bg-black min-h-screen text-center" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <h1 className="text-2xl font-bold text-white">Internship not found</h1>
        <Link to="/internships" className="mt-4 inline-block text-primary-400 hover:underline">Back to internships</Link>
      </div>
    );
  }

  return (
    <div className="py-16 bg-black min-h-screen" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/internships" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to internships
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-400" />
            </div>
            <Badge variant="success">{internship.status}</Badge>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">{internship.title}</h1>
          <div className="flex items-center gap-2 mt-3">
            <Building2 className="w-5 h-5 text-white/30" />
            <span className="text-white/50 font-medium">{internship.company}</span>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <Clock className="w-5 h-5 text-primary-400 mx-auto mb-2" />
            <p className="text-xs text-white/30">Duration</p>
            <p className="font-semibold text-white text-sm">{internship.duration}</p>
          </Card>
          <Card className="p-4 text-center">
            <MapPin className="w-5 h-5 text-primary-400 mx-auto mb-2" />
            <p className="text-xs text-white/30">Location</p>
            <p className="font-semibold text-white text-sm">{internship.location}</p>
          </Card>
          <Card className="p-4 text-center">
            <DollarSign className="w-5 h-5 text-primary-400 mx-auto mb-2" />
            <p className="text-xs text-white/30">Stipend</p>
            <p className="font-semibold text-white text-sm">{internship.stipend}</p>
          </Card>
          <Card className="p-4 text-center">
            <Calendar className="w-5 h-5 text-primary-400 mx-auto mb-2" />
            <p className="text-xs text-white/30">Type</p>
            <p className="font-semibold text-white text-sm">{internship.type}</p>
          </Card>
        </motion.div>

        {/* Description */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">About this Internship</h2>
            <p className="text-white/50 leading-relaxed font-normal">{internship.description}</p>
          </Card>
        </motion.div>

        {/* Requirements */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Requirements</h2>
          <div className="grid grid-cols-2 gap-3">
            {internship.requirements.map(req => (
              <div key={req} className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm text-white/70">{req}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Apply */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card className="p-8 bg-primary-500/5 border-primary-500/15">
            <div className="text-center">
              <Users className="w-10 h-10 text-primary-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">Interested in this internship?</h3>
              <p className="text-white/40 mb-6 font-normal">Apply now and start your journey with NexoraMind Tech.</p>
              <Link to="/register">
                <Button size="lg">Apply Now</Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
