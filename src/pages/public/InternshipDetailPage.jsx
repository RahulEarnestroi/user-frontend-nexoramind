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
import { formatDate } from '../../lib/utils';

export default function InternshipDetailPage() {
  const { id } = useParams();
  const internship = internships.find(i => i.id === id);

  if (!internship) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Internship not found</h1>
        <Link to="/internships" className="mt-4 inline-block text-primary-600 hover:underline">Back to internships</Link>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gradient-subtle min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/internships" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to internships
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-600" />
            </div>
            <Badge variant="success">{internship.status}</Badge>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">{internship.title}</h1>
          <div className="flex items-center gap-2 mt-3">
            <Building2 className="w-5 h-5 text-slate-400" />
            <span className="text-slate-600 font-medium">{internship.company}</span>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <Clock className="w-5 h-5 text-primary-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Duration</p>
            <p className="font-semibold text-slate-900 text-sm">{internship.duration}</p>
          </Card>
          <Card className="p-4 text-center">
            <MapPin className="w-5 h-5 text-primary-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Location</p>
            <p className="font-semibold text-slate-900 text-sm">{internship.location}</p>
          </Card>
          <Card className="p-4 text-center">
            <DollarSign className="w-5 h-5 text-primary-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Stipend</p>
            <p className="font-semibold text-slate-900 text-sm">{internship.stipend}</p>
          </Card>
          <Card className="p-4 text-center">
            <Calendar className="w-5 h-5 text-primary-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Type</p>
            <p className="font-semibold text-slate-900 text-sm">{internship.type}</p>
          </Card>
        </motion.div>

        {/* Description */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">About this Internship</h2>
            <p className="text-slate-600 leading-relaxed">{internship.description}</p>
          </Card>
        </motion.div>

        {/* Requirements */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Requirements</h2>
          <div className="grid grid-cols-2 gap-3">
            {internship.requirements.map(req => (
              <div key={req} className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg border border-slate-100 card-shadow">
                <CheckCircle className="w-4 h-4 text-success-500 shrink-0" />
                <span className="text-sm text-slate-700">{req}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Apply */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Card className="p-8 bg-primary-50 border-primary-100">
            <div className="text-center">
              <Users className="w-10 h-10 text-primary-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Interested in this internship?</h3>
              <p className="text-slate-600 mb-6">Apply now and start your journey with NexoraMind Tech.</p>
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
