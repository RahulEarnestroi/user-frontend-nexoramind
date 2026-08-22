import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Clock, MapPin, ChevronRight, Building2, Download, FileText } from 'lucide-react';
import { internships } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function InternshipsPage() {
  const { isAuthenticated } = useAuth();
  const { meStatus } = useProfile();
  const navigate = useNavigate();

  const handleGetInternship = () => {
    navigate('/login');
  };

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
                </div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {internship.requirements.map(req => (
                    <span key={req} className="px-2 py-0.5 bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-white/50 rounded-md text-xs font-medium border border-slate-200 dark:border-white/[0.06]">{req}</span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  {/* Not logged in → show Get Internship → redirect to /login */}
                  {!isAuthenticated && (
                    <button
                      onClick={handleGetInternship}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all"
                    >
                      Get Internship <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  {/* Logged in + meStatus is true → show View Tasks, Certificate, Offer Letter */}
                  {isAuthenticated && meStatus === true && (
                    <>
                      <Link to={`/internships/${internship.id}`}>
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all">
                          View Tasks <ChevronRight className="w-4 h-4" />
                        </button>
                      </Link>
                      <div className="grid grid-cols-2 gap-2">
                        <Link to={`/certificates-list`}>
                          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] dark:border-white/[0.08] text-slate-600 dark:text-white/60 text-sm font-medium hover:bg-white/[0.08] dark:hover:bg-white/[0.08] transition-all">
                            <Download className="w-3.5 h-3.5" /> Certificate
                          </button>
                        </Link>
                        <Link to={`/offer-letters`}>
                          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] dark:border-white/[0.08] text-slate-600 dark:text-white/60 text-sm font-medium hover:bg-white/[0.08] dark:hover:bg-white/[0.08] transition-all">
                            <FileText className="w-3.5 h-3.5" /> Offer Letter
                          </button>
                        </Link>
                      </div>
                    </>
                  )}

                  {/* Logged in + meStatus is false → show Get Internship */}
                  {isAuthenticated && meStatus === false && (
                    <button
                      onClick={handleGetInternship}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:opacity-90 transition-all"
                    >
                      Get Internship <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
