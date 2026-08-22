import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, ChevronDown, Shield, Award, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../../assets/Logo.png';

/* ─── Dropdown Data ─────────────────────────────────────── */

const certificationLinks = [
  { to: '/certifications', label: 'All Certifications', desc: 'Browse all available certifications', icon: Award },
  { to: '/certifications/frontend', label: 'Frontend Development', desc: 'React, Vue, Angular', icon: Shield },
  { to: '/certifications/backend', label: 'Backend Development', desc: 'Node.js, Python, Go', icon: Shield },
  { to: '/certifications/datascience', label: 'Data Science & ML', desc: 'Python, TensorFlow', icon: Shield },
  { to: '/certifications/cloud', label: 'Cloud Computing', desc: 'AWS, Azure, GCP', icon: Shield },
];

/* ─── Dropdown Component ────────────────────────────────── */

function Dropdown({ items, isOpen }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl bg-white dark:bg-[#111] border border-slate-200/60 dark:border-white/[0.08] shadow-2xl shadow-black/8 p-2 z-50"
        >
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors duration-150 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-500/15 dark:to-secondary-500/15 flex items-center justify-center shrink-0 group-hover:from-primary-100 group-hover:to-secondary-100 dark:group-hover:from-primary-500/25 dark:group-hover:to-secondary-500/25 transition-all">
                <item.icon className="w-4 h-4 text-primary-500 dark:text-primary-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{item.label}</p>
                <p className="text-xs text-slate-400 dark:text-white/35 font-medium">{item.desc}</p>
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Theme Toggle Button ───────────────────────────────── */

function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all duration-200 ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
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
  const { theme } = useTheme();
  const isHeroPage = location.pathname === '/';
  const isDarkMode = theme === 'dark';
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

  // Dark-mode-aware transparent text colors
  const navText = (active) => {
    if (isTransparent) {
      return isDarkMode
        ? (active ? 'text-white bg-white/[0.1]' : 'text-white/60 hover:text-white hover:bg-white/[0.08]')
        : (active ? 'text-primary-700 bg-white/[0.6]' : 'text-slate-600 hover:text-slate-900 hover:bg-white/[0.5]');
    }
    return active
      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10'
      : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.06]';
  };

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
          : 'bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none'
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
                ? isDarkMode
                  ? 'bg-white/[0.07] backdrop-blur-sm border border-white/[0.08]'
                  : 'bg-slate-900/[0.07] backdrop-blur-sm border border-slate-900/[0.08]'
                : 'bg-slate-200/60 dark:bg-white/[0.05] border border-slate-300/60 dark:border-white/[0.08]'
            }`}>
              <Link to="/" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${navText(location.pathname === '/')}`}>
                Home
              </Link>

              {/* Certifications Dropdown */}
              {/* <div className="relative" onMouseEnter={() => handleMouseEnter('certifications')} onMouseLeave={handleMouseLeave}>
                <button className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${navText(activeDropdown === 'certifications')}`}>
                  Certifications
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'certifications' ? 'rotate-180' : ''}`} />
                </button>
                <Dropdown items={certificationLinks} isOpen={activeDropdown === 'certifications'} />
              </div> */}

              <Link to="/internships" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${navText(location.pathname === '/internships')}`}>
                Internships
              </Link>

              <Link to="/certificates-list" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${navText(location.pathname === '/certificates-list')}`}>
                Certificates
              </Link>

              <Link to="/offer-letters" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${navText(location.pathname === '/offer-letters')}`}>
                Offer Letters
              </Link>

              {/* <Link to="/verify" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${navText(location.pathname === '/verify')}`}>
                Verify
              </Link> */}

              <Link to="/about" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${navText(location.pathname === '/about')}`}>
                About
              </Link>
            </div>
          </div>

          {/* ── Desktop Actions ── */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle className={isTransparent ? (isDarkMode ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50') : 'text-slate-400 dark:text-white/50 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'} />

            {user ? (
              <div className="flex items-center gap-1">
                <Link
                  to={user.role === 'ADMIN' || user.role === 'ISSUER' ? '/admin/dashboard' : '/student/dashboard'}
                  className={`text-sm font-medium transition-colors px-3 py-2 rounded-xl ${
                    isTransparent ? (isDarkMode ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900') : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className={`text-sm font-medium transition-colors px-3 py-2 rounded-xl ${
                    isTransparent ? (isDarkMode ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50/50') : 'text-slate-400 dark:text-white/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
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
                      ? (isDarkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50')
                      : 'text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
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

          {/* ── Mobile Toggle + Theme ── */}
          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle className={isTransparent ? (isDarkMode ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50') : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/[0.06]'} />
            <button
              className={`p-2 rounded-xl transition-all duration-200 ${
                isTransparent ? (isDarkMode ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50') : 'text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
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
            <div className="px-3 pb-5 bg-white dark:bg-black border-t border-slate-100 dark:border-white/[0.06]">
              <div className="pt-3 space-y-1">
                <Link to="/" onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/'
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >Home</Link>

                {/* Certifications */}
                <div>
                  <button onClick={() => toggleMobileSection('certifications')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      expandedMobile === 'certifications'
                        ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : 'text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Certifications</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expandedMobile === 'certifications' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedMobile === 'certifications' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="pl-4 pb-1 pt-1 space-y-0.5">
                          {certificationLinks.map((item) => (
                            <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-all"
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/15 flex items-center justify-center shrink-0">
                                <item.icon className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                              </div>
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/internships" onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/internships'
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >Internships</Link>

                <Link to="/certificates-list" onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/certificates-list'
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >Certificates</Link>

                <Link to="/offer-letters" onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/offer-letters'
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >Offer Letters</Link>

                <Link to="/verify" onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/verify'
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >Verify</Link>

                <Link to="/about" onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/about'
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >About</Link>

                {/* Account */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                  {user ? (
                    <div className="space-y-1.5">
                      <Link to={user.role === 'ADMIN' || user.role === 'ISSUER' ? '/admin/dashboard' : '/student/dashboard'}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all"
                      >
                        <span>Dashboard</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-white/20" />
                      </Link>
                      <button onClick={() => { logout(); setMobileOpen(false); }}
                        className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      >Logout</button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <Link to="/login" onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-white/70 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-all border border-slate-200 dark:border-white/[0.08]"
                      >Login</Link>
                      <Link to="/register" onClick={() => setMobileOpen(false)}
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
