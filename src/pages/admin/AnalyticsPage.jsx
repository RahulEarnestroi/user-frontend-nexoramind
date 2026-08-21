import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Shield, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Card, { CardContent } from '../../components/ui/Card';
import { analyticsData } from '../../data/mockData';

const COLORS = ['#6366f1', '#a855f7', '#22c55e', '#f59e0b'];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl  font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-1">Platform analytics and insights</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Issued', value: analyticsData.totalCertificates, icon: Award, color: 'text-primary-600 bg-primary-100' },
          { label: 'Verified', value: analyticsData.verifiedCertificates, icon: Shield, color: 'text-success-600 bg-success-50' },
          { label: 'Students', value: analyticsData.totalStudents, icon: Users, color: 'text-purple-600 bg-purple-100' },
          { label: 'Pass Rate', value: analyticsData.passRate + '%', icon: TrendingUp, color: 'text-blue-600 bg-blue-100' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Issuance */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Certificates Issued Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analyticsData.monthlyIssuance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Verification Activity */}
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Verification Activity (This Week)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analyticsData.verificationActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Certification Popularity */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Certification Popularity</h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analyticsData.certificationPopularity}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="count"
              >
                {analyticsData.certificationPopularity.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {analyticsData.certificationPopularity.map((cert, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{cert.name}</p>
                  <p className="text-xs text-slate-500">{cert.count} certificates</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
