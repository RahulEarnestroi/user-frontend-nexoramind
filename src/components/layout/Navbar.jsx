import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, ChevronDown, Shield, Award, Briefcase, CheckCircle, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/Logo.png';

/* ─── Dropdown Data ─────────────────────────────────────── */

const certificationLinks = [
  { to: '/certifications', label: 'All Certifications', desc: 'Browse all available certifications', icon: Award },
  { to: '/certifications/frontend', label: 'Frontend Development', desc: 'React, Vue, Angular', icon: Shield },
  { to: '/certifications/backend', label: 'Backend Development', desc: 'Node.js, Python, Go', icon: Shield },
  { to: '/certifications/datascience', label: 'Data Science & ML', desc: 'Python, TensorFlow', icon: Shield },
  { to: '/certifications/cloud', label: 'Cloud Computing', desc: 'AWS, Azure, GCP', icon: Shield },
];

const internshipLinks = [
  { to: '/internships', label: 'All Internships', desc: 'Browse all open positions', icon: Briefcase },
  { to: '/internships/frontend', label: 'Frontend Intern', desc: 'React, Vue, Angular', icon: Briefcase },
  { to: '/internships/backend', label: 'Backend Intern', desc: 'Node.js, Python, Go', icon: Briefcase },
  { to: '/internships/fullstack', label: 'Full-Stack Intern', desc: 'End-to-end development', icon: Briefcase },
  { to: '/internships/devops', label: 'DevOps Intern', desc: 'Docker, Kubernetes', icon: Briefcase },
];

const moreLinks = [
  { to: '/verify', label: 'Verify Certificate', desc: 'Validate any certificate', icon: CheckCircle },
  { to: '/offer-letter', label: 'Download Offer Letter', desc: 'Get your offer letter', icon: Award },
  { to: '/about', label: 'About Us', desc: 'Learn about NexoraMind', icon: Shield },
];

/* ─── Dropdown Component ────────────────────────────────── */

function Dropdown({ items, isOpen, transparent }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl bg-white border border-slate-200/60 shadow-2xl shadow-black/8 p-2 z-50"
        >
          {items.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors duration-150 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center shrink-0 group-hover:from-primary-100 group-hover:to-secondary-100 transition-all">
                <item.icon className="w-4 h-4 text-primary-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{item.label}</p>
                <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Navbar ────────────────────────────────────────────── */

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [expandedMobile, setExpandedMobile] = useState(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const isHeroPage = location.pathname === '/';
  const dropdownTimeout = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const isTransparent = isHeroPage && !scrolled;

  const handleMouseEnter = (key) => {
    clearTimeout(dropdownTimeout.current);
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const toggleMobileSection = (key) => {
    setExpandedMobile(expandedMobile === key ? null : key);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">

          {/* ── Logo ── */}
          <Link to="/" className="shrink-0 group">
            <img src={Logo} alt="NexoraMind" className="w-[120px] h-auto" />
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center">
            <div className={`flex items-center gap-0.5 px-1.5 py-1 rounded-2xl transition-all duration-300 ${
              isTransparent
                ? 'bg-white/[0.07] backdrop-blur-sm border border-white/[0.08]'
                : 'bg-slate-100/80 border border-slate-200/60'
            }`}>
              {/* Home */}
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/'
                    ? isTransparent
                      ? 'text-white bg-white/[0.1]'
                      : 'text-primary-600 bg-primary-50'
                    : isTransparent
                      ? 'text-white/60 hover:text-white hover:bg-white/[0.08]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                }`}
              >
                Home
              </Link>

              {/* Certifications Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('certifications')}
                onMouseLeave={handleMouseLeave}
              >
                <button className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeDropdown === 'certifications'
                    ? isTransparent
                      ? 'text-white bg-white/[0.1]'
                      : 'text-primary-600 bg-primary-50'
                    : isTransparent
                      ? 'text-white/60 hover:text-white hover:bg-white/[0.08]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                }`}>
                  Certifications
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'certifications' ? 'rotate-180' : ''}`} />
                </button>
                <Dropdown items={certificationLinks} isOpen={activeDropdown === 'certifications'} transparent={isTransparent} />
              </div>

              {/* Internships Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('internships')}
                onMouseLeave={handleMouseLeave}
              >
                <button className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeDropdown === 'internships'
                    ? isTransparent
                      ? 'text-white bg-white/[0.1]'
                      : 'text-primary-600 bg-primary-50'
                    : isTransparent
                      ? 'text-white/60 hover:text-white hover:bg-white/[0.08]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                }`}>
                  Internships
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'internships' ? 'rotate-180' : ''}`} />
                </button>
                <Dropdown items={internshipLinks} isOpen={activeDropdown === 'internships'} transparent={isTransparent} />
              </div>

              {/* Verify */}
              <Link
                to="/verify"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/verify'
                    ? isTransparent
                      ? 'text-white bg-white/[0.1]'
                      : 'text-primary-600 bg-primary-50'
                    : isTransparent
                      ? 'text-white/60 hover:text-white hover:bg-white/[0.08]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                }`}
              >
                Verify
              </Link>

              {/* More Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('more')}
                onMouseLeave={handleMouseLeave}
              >
                <button className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeDropdown === 'more'
                    ? isTransparent
                      ? 'text-white bg-white/[0.1]'
                      : 'text-primary-600 bg-primary-50'
                    : isTransparent
                      ? 'text-white/60 hover:text-white hover:bg-white/[0.08]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                }`}>
                  More
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'more' ? 'rotate-180' : ''}`} />
                </button>
                <Dropdown items={moreLinks} isOpen={activeDropdown === 'more'} transparent={isTransparent} />
              </div>
            </div>
          </div>

          {/* ── Desktop Actions ── */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user.role === 'ADMIN' || user.role === 'ISSUER' ? '/admin/dashboard' : '/student/dashboard'}
                  className={`text-sm font-medium transition-colors px-4 py-2 rounded-xl ${
                    isTransparent ? 'text-white/70 hover:text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className={`text-sm font-medium transition-colors px-4 py-2 rounded-xl ${
                    isTransparent ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isTransparent
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}>
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
                    <div className="relative flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer">
                      Get Certified
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Toggle ── */}
          <button
            className={`lg:hidden p-2 rounded-xl transition-all duration-200 ${
              isTransparent ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden overflow-hidden"
          >
            <div className="px-3 pb-5 bg-white border-t border-slate-100">
              <div className="pt-3 space-y-1">

                {/* Home */}
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  Home
                </Link>

                {/* Certifications Expandable */}
                <div>
                  <button
                    onClick={() => toggleMobileSection('certifications')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      expandedMobile === 'certifications'
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>Certifications</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedMobile === 'certifications' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedMobile === 'certifications' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 pb-1 pt-1 space-y-0.5">
                          {certificationLinks.map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                                <item.icon className="w-3.5 h-3.5 text-primary-500" />
                              </div>
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Internships Expandable */}
                <div>
                  <button
                    onClick={() => toggleMobileSection('internships')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      expandedMobile === 'internships'
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>Internships</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedMobile === 'internships' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedMobile === 'internships' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 pb-1 pt-1 space-y-0.5">
                          {internshipLinks.map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
                            >
                              <div className="w-8 h-8 rounded-lg bg-secondary-50 flex items-center justify-center shrink-0">
                                <item.icon className="w-3.5 h-3.5 text-secondary-500" />
                              </div>
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Verify */}
                <Link
                  to="/verify"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/verify'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  Verify Certificate
                </Link>

                {/* More Expandable */}
                <div>
                  <button
                    onClick={() => toggleMobileSection('more')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      expandedMobile === 'more'
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>More</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedMobile === 'more' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedMobile === 'more' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 pb-1 pt-1 space-y-0.5">
                          {moreLinks.map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <item.icon className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Account Section */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  {user ? (
                    <div className="space-y-1.5">
                      <Link
                        to={user.role === 'ADMIN' || user.role === 'ISSUER' ? '/admin/dashboard' : '/student/dashboard'}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                      >
                        <span>Dashboard</span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </Link>
                      <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="relative flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:opacity-95 transition-all shadow-lg shadow-primary-500/20"
                      >
                        Get Certified
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
