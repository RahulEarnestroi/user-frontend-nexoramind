import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Logo from '../../assets/Logo.png';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/certifications', label: 'Certifications' },
  { to: '/internships', label: 'Internships' },
  { to: '/verify', label: 'Verify' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const isHeroPage = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isTransparent = isHeroPage && !scrolled;

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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          
            <span className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
              isTransparent ? 'text-white' : 'text-slate-900'
            }`}>
            <img src={Logo} alt="Nexora" className="w-[120px]" height={40} />
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center">
            <div className={`flex items-center gap-1 px-1.5 py-1 rounded-2xl transition-all duration-300 ${
              isTransparent
                ? 'bg-white/[0.07] backdrop-blur-sm border border-white/[0.08]'
                : 'bg-slate-100/80 border border-slate-200/60'
            }`}>
              {navLinks.map(link => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? isTransparent
                          ? 'text-white bg-white/[0.15]'
                          : 'text-[#0080F8] bg-[#0080F8]/10'
                        : isTransparent
                          ? 'text-white/60 hover:text-white hover:bg-white/[0.08]'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
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
                  <button className={`px-4 py-2 rounded-xl bg-[#3d1276] text-sm font-medium transition-all duration-200 ${
                    isTransparent
                      ? 'text-white/70 hover:text-white bg-secondary-800 hover:bg-white/10'
                      : 'text-white hover:text-slate-900 bg-secondary-800 hover:bg-slate-100'
                  }`}>
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <div className="relative group">
                    <div className="absolute -inset-0.5  rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
                    <div className="relative flex items-center gap-1.5 px-5 py-2 bg-primary-900 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer">
                      Get Certified
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className={`md:hidden p-2 rounded-xl transition-all duration-200 ${
              isTransparent ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${
        mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pb-4 bg-black backdrop-blur-2xl border-t border-slate-100">
          <div className="pt-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? 'text-white bg-primary-400'
                    : 'text-white hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-slate-100 space-y-2">
              {user ? (
                <>
                  <Link
                    to={user.role === 'ADMIN' || user.role === 'ISSUER' ? '/admin/dashboard' : '/student/dashboard'}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl bg-primary-600 text-sm font-medium text-white hover:bg-slate-50">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-semibold text-white bg-secondary-900 text-center shadow-lg shadow-[#0080F8]/20">
                    Get Certified
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
