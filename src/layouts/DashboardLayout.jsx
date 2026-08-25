import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/layout/Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const { profileData, clearProfile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const userName = profileData?.full_name || 'User';
  const userId = profileData?.user_id || '';
  const initial = userName.charAt(0).toUpperCase();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    clearProfile();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-[250px]">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Left: Mobile hamburger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600 dark:text-white/60" />
              </button>
              <Link to="/dashboard" className="lg:hidden">
                <span className="text-sm font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  NexoraMind
                </span>
              </Link>
            </div>

            {/* Right: Theme toggle + Profile + Logout */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-400 dark:text-white/50 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>

              <div className="w-px h-6 bg-slate-200 dark:bg-white/[0.08]" />

              {/* Profile */}
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-default">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {initial}
                </div>
                <div className="hidden sm:block leading-none">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{userName}</p>
                  {userId && <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium">{userId}</p>}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 dark:text-white/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
