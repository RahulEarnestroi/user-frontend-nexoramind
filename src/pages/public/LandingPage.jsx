import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Award, Shield, ArrowRight, QrCode, Users, Globe,
  ChevronRight, Briefcase, Code, Cpu, Palette, Database, Cloud,
  Zap, Lock, Sparkles, ArrowUpRight, TrendingUp, Target
} from 'lucide-react';
import Card from '../../components/ui/Card';
import PremiumCertificate from '../../components/ui/PremiumCertificate';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function Section({ children, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Animated floating ring */
function FloatingRing({ className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute ${className}`}
    >
      <div className="w-full h-full rounded-full border border-white/[0.06] animate-float" style={{ animationDelay: `${delay}s` }} />
    </motion.div>
  );
}

/* Particle dot */
function Dot({ x, y, delay = 0, size = 3 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.6, 0] }}
      transition={{ duration: 3, delay, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute rounded-full bg-[#0080F8]/40"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
    />
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
        {/* Deep gradient background */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-[#020214] via-[#080860] to-[#080860]" /> */}

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Animated gradient orbs */}
        <div className="absolute top-[10%] right-[5%] w-[600px] h-[600px] rounded-full blur-[140px] animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(0,128,248,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[5%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(112,40,192,0.14) 0%, transparent 70%)', animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full blur-[100px] animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(0,128,248,0.08) 0%, transparent 70%)', animationDelay: '3s' }} />

        {/* Floating rings */}
        <FloatingRing className="w-[300px] h-[300px] top-[15%] right-[20%]" delay={0.5} />
        <FloatingRing className="w-[180px] h-[180px] bottom-[20%] left-[10%]" delay={0.8} />
        <FloatingRing className="w-[100px] h-[100px] top-[30%] left-[25%]" delay={1.1} />

        {/* Particle dots */}
        <div className="absolute inset-0 hidden lg:block">
          {[
            { x: 10, y: 20, d: 0 }, { x: 85, y: 15, d: 0.5 }, { x: 70, y: 70, d: 1 },
            { x: 20, y: 80, d: 1.5 }, { x: 90, y: 45, d: 2 }, { x: 45, y: 10, d: 0.3 },
            { x: 60, y: 85, d: 1.2 }, { x: 5, y: 50, d: 2.2 }, { x: 75, y: 30, d: 0.8 },
            { x: 35, y: 65, d: 1.8 }, { x: 55, y: 25, d: 0.6 }, { x: 95, y: 60, d: 2.5 },
          ].map((dot, i) => <Dot key={i} x={dot.x} y={dot.y} delay={dot.d} />)}
        </div>

        {/* Glow line at top */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#0080F8]/60 to-transparent" />

        {/* Main content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left: Text */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              {/* Badge */}
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-md mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0080F8] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0080F8]"></span>
                </span>
                <span className="text-white/70 text-sm font-medium">Certification & Internship Platform</span>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-extrabold text-white leading-[1.08] tracking-tight">
                Empower Your
                <br />
                <span className="relative inline-block">
                  <span className="text-white">
                    Tech Career
                  </span>
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute -bottom-1 left-0 h-[3px] bg-gradient-to-r from-[#0080F8] to-[#7028C0] rounded-full"
                  />
                </span>
                <br />
                <span className="text-white/90">with NexoraMind</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p variants={fadeUp} className="mt-7 text-lg text-white/50 leading-relaxed max-w-lg">
                Earn verified certifications, access real-world internships, and prove your skills with industry-recognized credentials.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
                <Link to="/certifications">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#0080F8] to-[#7028C0] rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition duration-400" />
                    <div className="relative flex items-center gap-2.5 px-8 py-4 bg-secondary-800 text-white text-base font-semibold rounded-2xl hover:shadow-[0_0_40px_rgba(0,128,248,0.3)] transition-all duration-300 cursor-pointer">
                      Get Certified
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
                <Link to="/internships">
                  <div className="flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-white/[0.12] text-white/80 text-base font-semibold hover:bg-white/[0.05] hover:border-white/[0.2] transition-all duration-300 cursor-pointer backdrop-blur-sm">
                    <Briefcase className="w-5 h-5" /> Browse Internships
                  </div>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div variants={fadeUp} className="mt-12 flex items-center gap-6">
                {[
                  { icon: Shield, label: 'Cryptographically Verified' },
                  { icon: QrCode, label: 'Instant QR Validation' },
                  { icon: Globe, label: 'Globally Recognized' },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/35">
                    <badge.icon className="w-4 h-4 text-[#0080F8]/60" />
                    <span>{badge.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Premium Certificate Card */}
            <motion.div
              initial={{ opacity: 0, x: 80, scale: 0.92, rotateY: 8 }}
              animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex justify-center items-center"
            >
              <div className="relative">
                {/* Glow behind card */}
                <div className="absolute -inset-12 bg-gradient-to-br from-[#c026d3]/12 to-[#7028C0]/8 rounded-[2rem] blur-3xl" />

                {/* Floating notification */}
               

                {/* Floating stats badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20, x: 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ delay: 1.5, duration: 0.6 }}
                  className="absolute -right-6 top-4 z-20 flex items-center gap-2.5 px-4 py-3 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl"
                >
                  <div className="flex -space-x-1.5">
                    {['bg-[#c026d3]', 'bg-[#7028C0]', 'bg-[#0080F8]'].map((bg, i) => (
                      <div key={i} className={`w-6 h-6 ${bg} rounded-full border-2 border-white flex items-center justify-center`}>
                        <span className="text-[8px] text-white font-bold">{['A', 'B', 'C'][i]}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-slate-800 text-xs font-semibold">986+ Students</p>
                    <p className="text-slate-400 text-[10px]">Certified this year</p>
                  </div>
                </motion.div>

                {/* Certificate card */}
                <PremiumCertificate />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom fade to white */}
        {/* <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent" /> */}
      </section>

      {/* ============ STATS ============ */}
      <section className="py-16 bg-white relative -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '1,248+', label: 'Certificates Issued', icon: Award },
              { value: '986', label: 'Students Certified', icon: Users },
              { value: '50+', label: 'Internship Positions', icon: Briefcase },
              { value: '87%', label: 'Pass Rate', icon: TrendingUp },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center p-6 rounded-2xl border border-slate-100 bg-white hover:border-[#0080F8]/20 hover:shadow-[0_0_30px_rgba(0,128,248,0.06)] transition-all duration-300"
              >
                <div className="w-11 h-11 mx-auto bg-gradient-to-br from-[#0080F8]/10 to-[#7028C0]/10 rounded-xl flex items-center justify-center mb-3">
                  <stat.icon className="w-5 h-5 text-[#0080F8]" />
                </div>
                <p className="text-3xl font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0080F8]/5 text-[#0080F8] text-xs font-semibold mb-4 border border-[#0080F8]/10">
                <Zap className="w-3 h-3" /> Why NexoraMind
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Built for Modern Tech Professionals</h2>
              <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-lg">A certification and internship platform designed for developers who move fast.</p>
            </div>
          </Section>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Verified Certificates', desc: 'Every certificate has a unique ID and QR code for instant, tamper-proof verification.' },
              { icon: QrCode, title: 'QR Code Verification', desc: 'Scan any certificate QR code to verify authenticity in real-time.' },
              { icon: Briefcase, title: 'Internship Pipeline', desc: 'Access curated internship positions at top tech companies and startups.' },
              { icon: Users, title: 'Team Certifications', desc: 'Issue and manage certifications for your team, bootcamp, or training program.' },
              { icon: Award, title: 'Premium Credentials', desc: 'Beautiful, professionally designed PDF certificates ready for LinkedIn sharing.' },
              { icon: Lock, title: 'Cryptographic Trust', desc: 'Every certificate is cryptographically signed and cannot be forged or duplicated.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Card hover className="p-6 h-full group">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0080F8]/10 to-[#7028C0]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:from-[#0080F8]/20 group-hover:to-[#7028C0]/20 transition-all">
                    <feature.icon className="w-6 h-6 text-[#0080F8]" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TECH DOMAINS ============ */}
      <section className="py-24 bg-gradient-subtle relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0080F8]/5 text-[#0080F8] text-xs font-semibold mb-4 border border-[#0080F8]/10">
                <Target className="w-3 h-3" /> Tech Domains
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Certifications Across the Stack</h2>
              <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-lg">From frontend to cloud infrastructure, we cover every layer.</p>
            </div>
          </Section>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Code, label: 'Frontend Development', desc: 'React, Vue, Angular' },
              { icon: Database, label: 'Backend & APIs', desc: 'Node.js, Python, Go' },
              { icon: Cpu, label: 'Data Science & ML', desc: 'Python, TensorFlow' },
              { icon: Cloud, label: 'Cloud Computing', desc: 'AWS, Azure, GCP' },
              { icon: Palette, label: 'UI/UX Design', desc: 'Figma, Design Systems' },
              { icon: Globe, label: 'DevOps & CI/CD', desc: 'Docker, Kubernetes' },
            ].map((domain, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <div className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 card-shadow hover:border-[#0080F8]/20 hover:shadow-[0_0_30px_rgba(0,128,248,0.06)] transition-all duration-300 cursor-pointer">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#0080F8]/10 to-[#7028C0]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:from-[#0080F8]/20 group-hover:to-[#7028C0]/20 transition-all">
                    <domain.icon className="w-5 h-5 text-[#0080F8]" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 text-sm block">{domain.label}</span>
                    <span className="text-xs text-slate-400">{domain.desc}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 ml-auto opacity-0 group-hover:opacity-100 group-hover:text-[#0080F8] transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0080F8]/5 text-[#0080F8] text-xs font-semibold mb-4 border border-[#0080F8]/10">
                <Sparkles className="w-3 h-3" /> How It Works
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">From Learning to Certified</h2>
              <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-lg">Four simple steps to advance your career.</p>
            </div>
          </Section>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-[#0080F8]/20 via-[#0080F8]/40 to-[#7028C0]/20" />

            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with email or Google in seconds.' },
              { step: '02', title: 'Choose Certification', desc: 'Pick from 8+ tech domain certifications.' },
              { step: '03', title: 'Pass Assessment', desc: 'Complete the exam and earn your score.' },
              { step: '04', title: 'Get Certified', desc: 'Receive your verified, shareable certificate.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="text-center relative"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#0080F8] to-[#7028C0] rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-lg shadow-[#0080F8]/20">
                  <span className=" font-bold text-xl">{item.step}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#7028C0]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#0080F8]/8 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Section>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Ready to Get
              <span className="text-transparent bg-clip-text bg-white"> Certified</span>?
            </h2>
            <p className="mt-6 text-lg text-white/40 max-w-xl mx-auto">
              Join hundreds of developers who have earned their certification through NexoraMind Tech.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/certifications">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#0080F8] to-[#7028C0] rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition duration-400" />
                  <div className="relative flex items-center gap-2.5 px-8 py-4 bg-secondary-900 text-white text-base font-semibold rounded-2xl hover:shadow-[0_0_40px_rgba(0,128,248,0.3)] transition-all duration-300 cursor-pointer">
                    Explore Certifications
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
              <Link to="/internships">
                <div className="flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-white/[0.12] text-white/80 text-base font-semibold hover:bg-white/[0.05] hover:border-white/[0.2] transition-all duration-300 cursor-pointer backdrop-blur-sm">
                  <Briefcase className="w-5 h-5" /> View Internships
                </div>
              </Link>
            </div>
          </Section>
        </div>
      </section>
    </div>
  );
}
