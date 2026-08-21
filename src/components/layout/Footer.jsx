import { Link } from 'react-router-dom';
import { Globe, Mail, ArrowUpRight } from 'lucide-react';
import Logo from '../../assets/Logo.png'

// const LOGO_URL = 'https://nexoramind.space/assets/nexomind_full_logo_light-vNj1hUfv.png';

const footerLinks = {
  Platform: [
    { to: '/certifications', label: 'Certifications' },
    { to: '/internships', label: 'Internships' },
    { to: '/verify', label: 'Verify Certificate' },
    { to: '/about', label: 'About' },
  ],
  Account: [
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
    // { to: '/contact', label: 'Contact' },
  ],
};

export default function Footer() {
  return (
    <footer className=" text-white relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link to="/" className="inline-block mb-5">
              <img src={Logo} alt="NexoraMind Tech" className="h-8 w-auto" />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Empowering students with verified certifications and real-world internship opportunities. Build. Certify. Advance.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="https://nexoramind.space" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-500/20 hover:border-primary-500/30 transition-all duration-300">
                <Globe className="w-4 h-4" />
              </a>
              <a href="mailto:support@nexoramind.space" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-500/20 hover:border-primary-500/30 transition-all duration-300">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="md:col-span-3">
              <h4 className="font-semibold text-sm text-white mb-4 tracking-wide uppercase">{title}</h4>
              <div className="space-y-3">
                {links.map(link => (
                  <Link key={link.to} to={link.to} className="group flex items-center gap-1 text-sm text-slate-400 hover:text-primary-400 transition-colors">
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Newsletter */}
          <div className="md:col-span-1" />
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} NexoraMind Tech. All rights reserved.
          </p>
         
        </div>
      </div>
    </footer>
  );
}
