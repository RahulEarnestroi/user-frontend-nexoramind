import { Link } from 'react-router-dom';
import { Globe, Mail, ArrowUpRight, ChevronRight, Sparkles, Shield, CheckCircle } from 'lucide-react';
import Logo from '../../assets/Logo.png';

const footerSections = [
  {
    title: 'Platform',
    links: [
      { to: '/certifications', label: 'Certifications' },
      { to: '/certificates-list', label: 'Certificates' },
      { to: '/internships', label: 'Internships' },
      { to: '/offer-letters', label: 'Offer Letters' },
      { to: '/verify', label: 'Verify Certificate' },
      { to: '/about', label: 'About Us' },
    ],
  },
  {
    title: 'Domains',
    links: [
      { to: '/certifications/frontend', label: 'Frontend Development' },
      { to: '/certifications/backend', label: 'Backend Development' },
      { to: '/certifications/datascience', label: 'Data Science & ML' },
      { to: '/certifications/cloud', label: 'Cloud Computing' },
      { to: '/certifications/devops', label: 'DevOps & CI/CD' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/login', label: 'Login' },
      { to: '/register', label: 'Register' },
      { to: '/student/dashboard', label: 'Student Dashboard' },
      { to: '/about', label: 'About NexoraMind' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-black relative overflow-hidden border-t border-slate-200 dark:border-white/[0.06]">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

      {/* Ambient orbs */}
      <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] rounded-full blur-[120px] bg-primary-500/5 dark:bg-primary-500/5" />
      <div className="absolute bottom-0 right-[20%] w-[300px] h-[300px] rounded-full blur-[100px] bg-secondary-500/5 dark:bg-secondary-500/5" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-12 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="lg:col-span-5">
            <Link to="/" className="inline-block mb-5"><img src={Logo} alt="NexoraMind Tech" className="h-8 w-auto" /></Link>
            <p className="text-slate-500 dark:text-white/40 text-sm leading-relaxed max-w-sm mb-6">Empowering students with verified certifications and real-world internship opportunities. Build. Certify. Advance.</p>
            <div className="flex gap-3">
              <a href="https://nexoramind.space" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center justify-center text-slate-400 dark:text-white/40 hover:bg-primary-50 dark:hover:bg-primary-500/15 hover:border-primary-200 dark:hover:border-primary-500/25 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300">
                <Globe className="w-4 h-4" />
              </a>
              <a href="mailto:support@nexoramind.space" className="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] flex items-center justify-center text-slate-400 dark:text-white/40 hover:bg-primary-50 dark:hover:bg-primary-500/15 hover:border-primary-200 dark:hover:border-primary-500/25 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 lg:flex lg:items-start lg:justify-end">
            <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 tracking-wide uppercase">Get Started</span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg tracking-tight mb-2">Ready to advance your career?</h3>
              <p className="text-slate-500 dark:text-white/35 text-sm mb-4">Join thousands of students who have earned their certification through NexoraMind.</p>
              <Link to="/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/20 transition-all duration-300">
                Get Certified <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 py-12 border-b border-slate-200 dark:border-white/[0.06]">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-slate-900 dark:text-white font-semibold text-sm mb-4 tracking-wide">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="group flex items-center gap-1 text-sm text-slate-500 dark:text-white/35 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-slate-400 dark:text-white/25 text-sm">&copy; {new Date().getFullYear()} NexoraMind Tech. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/20"><Shield className="w-3 h-3" /> Cryptographically Verified</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/20"><CheckCircle className="w-3 h-3" /> 986+ Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
