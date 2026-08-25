import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, Award, FileText,
  LogOut, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import Logo from '../../assets/Logo.png';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/internships', icon: Briefcase, label: 'Internships' },
  { to: '/certificates-list', icon: Award, label: 'Certificates' },
  { to: '/offer-letters', icon: FileText, label: 'Offer Letters' },
];

const bottomItems = [
  { to: '/about', icon: ChevronRight, label: 'About' },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profileData, clearProfile } = useProfile();
  const userName = profileData?.full_name || 'User';
  const userId = profileData?.user_id || '';
  const initial = userName.charAt(0).toUpperCase();

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path) && location.pathname !== '/dashboard';
  };

  const handleLogout = () => {
    logout();
    clearProfile();
    onClose();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 h-[72px] flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06]">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
          <img src={Logo} alt="NexoraMind" className=" w-auto" />
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4 text-slate-500 dark:text-white/50" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/25">
          Menu
        </p>
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/15'
                  : 'text-slate-500 dark:text-white/50 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white/80 border border-transparent'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] ${active ? 'text-primary-500 dark:text-primary-400' : 'text-slate-400 dark:text-white/35 group-hover:text-slate-600 dark:group-hover:text-white/60'}`} />
              {item.label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400" />
              )}
            </Link>
          );
        })}

        <div className="!mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/25">
            Quick Links
          </p>
          {bottomItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.to)
                  ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                  : 'text-slate-500 dark:text-white/50 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white/80'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{userName}</p>
            {userId && <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium truncate">{userId}</p>}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 mt-1.5 rounded-xl text-sm font-medium text-slate-500 dark:text-white/45 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-40 h-screen w-[250px] bg-white dark:bg-black border-r border-slate-200 dark:border-white/[0.06] flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 lg:hidden backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 z-50 h-screen w-[280px] bg-white dark:bg-black border-r border-slate-200 dark:border-white/[0.06] flex flex-col lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
