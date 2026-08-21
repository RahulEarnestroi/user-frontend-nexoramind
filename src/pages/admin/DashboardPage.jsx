import { motion } from 'framer-motion';
import { Award, FileCheck, Shield, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardContent } from '../../components/ui/Card';
import { analyticsData, certificates } from '../../data/mockData';
import { formatDateShort } from '../../lib/utils';

const stats = [
  { label: 'Total Certificates', value: analyticsData.totalCertificates, icon: Award, color: 'bg-primary-100 text-primary-600', change: '+12%' },
  { label: 'Issued This Month', value: analyticsData.issuedThisMonth, icon: FileCheck, color: 'bg-blue-100 text-blue-600', change: '+8%' },
  { label: 'Verified Certificates', value: analyticsData.verifiedCertificates, icon: Shield, color: 'bg-success-50 text-success-600', change: '+5%' },
  { label: 'Total Students', value: analyticsData.totalStudents, icon: Users, color: 'bg-purple-100 text-purple-600', change: '+15%' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your certification platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card hover className="p-5">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-success-600 bg-success-50 px-2 py-0.5 rounded-full">{stat.change}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pass Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Pass Rate</h3>
            <TrendingUp className="w-5 h-5 text-success-500" />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-gradient">{analyticsData.passRate}%</div>
            <div className="flex-1">
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${analyticsData.passRate}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-2">Across all certifications</p>
            </div>
          </div>
        </Card>

        {/* Recent Certificates */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Certificates</h3>
            <Link to="/admin/certificates" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {certificates.slice(0, 5).map(cert => (
              <div key={cert.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{cert.studentName}</p>
                  <p className="text-xs text-slate-500 font-mono">{cert.certificateId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-700">{cert.score}%</p>
                  <p className="text-xs text-slate-500">{formatDateShort(cert.issueDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/certificates/issue" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Award className="w-4 h-4" /> Issue Certificate
          </Link>
          <Link to="/admin/certificates" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            View Certificates
          </Link>
          <Link to="/admin/analytics" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Analytics
          </Link>
        </div>
      </Card>
    </div>
  );
}
