import { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Award, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import Logo from '../assets/Logo.png';

const sidebarLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/certificates', icon: Award, label: 'My Certificates' },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user || user.role !== 'STUDENT') return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-white dark:bg-black flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      <aside className={cn(
        'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-white/[0.02] border-r border-slate-200 dark:border-white/[0.06] flex flex-col transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="px-5 py-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <Link to="/student/dashboard" className="flex items-center gap-2">
            <img src={Logo} alt="NexoraMind" className="h-7 w-auto" />
          </Link>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4 text-slate-500 dark:text-white/50" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {sidebarLinks.map(link => {
            const isActive = location.pathname === link.to || (link.to !== '/student/dashboard' && location.pathname.startsWith(link.to));
            return (
              <Link key={link.to} to={link.to} onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/15'
                    : 'text-slate-500 dark:text-white/50 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white/80'
                )}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">{user.name.charAt(0)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 dark:text-white/30 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-white/50 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.06] px-4 py-3 flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06]" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-slate-500 dark:text-white/60" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">{user.name.charAt(0)}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
