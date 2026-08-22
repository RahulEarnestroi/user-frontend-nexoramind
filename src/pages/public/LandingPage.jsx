import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  Award, Shield, ArrowRight, QrCode, Users, Globe,
  ChevronRight, Briefcase, Code, Cpu, Palette, Database, Cloud,
  Zap, Lock, Sparkles, ArrowUpRight, Target, Star,
  Download, Quote
} from 'lucide-react';


/* ─── Typewriter Effect ─────────────────────────────── */

function TypewriterText({ words, speed = 80, deleteSpeed = 50, pauseDuration = 2000 }) {
  const [displayedText, setDisplayedText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    if (!isDeleting) {
      if (displayedText.length < currentWord.length) {
        const timer = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1));
        }, speed);
        return () => clearTimeout(timer);
      } else {
        setIsPaused(true);
      }
    } else {
      if (displayedText.length > 0) {
        const timer = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, deleteSpeed);
        return () => clearTimeout(timer);
      } else {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    }
  }, [displayedText, isDeleting, isPaused, wordIndex, words, speed, deleteSpeed, pauseDuration]);

  return (
    <span style={{
      background: 'linear-gradient(135deg, #8ec4ff, #0080F8, #7028C0)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      display: 'inline',
    }}>
      {displayedText}
      <span style={{
        display: 'inline-block',
        width: '3px',
        height: '0.9em',
        backgroundColor: '#59a3ff',
        marginLeft: '4px',
        verticalAlign: 'middle',
      }} className="animate-pulse" />
    </span>
  );
}

/* ─── Animations ──────────────────────────────────────── */

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

function FloatingRing({ className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute ${className}`}
    >
      <div className="w-full h-full rounded-full border border-slate-200 dark:border-white/[0.06] animate-float" style={{ animationDelay: `${delay}s` }} />
    </motion.div>
  );
}

function Dot({ x, y, delay = 0, size = 3 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.6, 0] }}
      transition={{ duration: 3, delay, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute rounded-full bg-primary-400/40"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
    />
  );
}

function AnimatedCounter({ target, suffix = '', duration = 2 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (target >= 1000) return Math.round(v).toLocaleString();
    return Math.round(v);
  });
  const [display, setDisplay] = useState('0');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, { duration, ease: 'easeOut' });
      const unsub = rounded.on('change', (v) => setDisplay(v));
      return () => { controls.stop(); unsub(); };
    }
  }, [isInView, target, duration, count, rounded]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─── Data ────────────────────────────────────────────── */

const typewriterWords = [
  'Real World Experience',
  'Internship Programs',
  'Industry Certifications',
  'Hands-on Projects',
];

const liveMetrics = [
  { value: 1248, suffix: '+', label: 'Students Joined', desc: 'From learners across diverse tech backgrounds', icon: Users },
  { value: 986, suffix: '', label: 'Certificates Issued', desc: 'Issued after verified assignment completion', icon: Award },
  { value: 12, suffix: '+', label: 'Services', desc: 'Tools, platforms, and active services combined', icon: Briefcase },
  { value: 15, suffix: '+', label: 'Countries', desc: 'Global participation from learners worldwide', icon: Globe },
];

const features = [
  { icon: Shield, title: 'Verified Certificates', desc: 'Earn a certificate with a unique verification ID after completing required assignments successfully.' },
  { icon: Code, title: 'Assignment-Based Internships', desc: 'Our internships are built around predefined industry-style projects. Complete curated assignments to demonstrate real skills.' },
  { icon: Zap, title: 'Flexible Learning Schedule', desc: 'Work on assignments at your own pace while managing college, work, or personal commitments. No rigid class timings.' },
  { icon: Award, title: 'Real Portfolio Projects', desc: 'Choose from multiple practical projects designed to reflect real-world development tasks and strengthen your portfolio.' },
  { icon: Lock, title: 'Cryptographic Trust', desc: 'Every certificate is cryptographically signed and cannot be forged or duplicated.' },
  { icon: Globe, title: 'Globally Recognized', desc: 'Our certifications are recognized across industries and borders, opening doors worldwide.' },
];

const domains = [
  { icon: Code, label: 'Frontend Development', desc: 'React, Vue, Angular' },
  { icon: Database, label: 'Backend & APIs', desc: 'Node.js, Python, Go' },
  { icon: Cpu, label: 'Data Science & ML', desc: 'Python, TensorFlow' },
  { icon: Cloud, label: 'Cloud Computing', desc: 'AWS, Azure, GCP' },
  { icon: Palette, label: 'UI/UX Design', desc: 'Figma, Design Systems' },
  { icon: Globe, label: 'DevOps & CI/CD', desc: 'Docker, Kubernetes' },
];

const steps = [
  { step: '01', title: 'Create Account', desc: 'Sign up with email or Google in seconds.' },
  { step: '02', title: 'Choose Internship', desc: 'Pick from 8+ tech domain internships.' },
  { step: '03', title: 'Complete Assignments', desc: 'Work on real projects at your own pace.' },
  { step: '04', title: 'Get Certified', desc: 'Receive your verified, shareable certificate.' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Frontend Developer',
    domain: 'React.js Internship',
    text: 'NexoraMind gave me hands-on experience with real projects. The certificate helped me land my first job as a frontend developer.',
    rating: 5,
  },
  {
    name: 'Arjun Mehta',
    role: 'Full Stack Developer',
    domain: 'Full-Stack Web Dev',
    text: 'The assignment-based approach was refreshing. I actually built things instead of just watching videos. Highly recommended.',
    rating: 5,
  },
  {
    name: 'Sneha Patel',
    role: 'Data Analyst',
    domain: 'Data Science Internship',
    text: 'The flexible schedule allowed me to complete the internship alongside my college. The certificate is well-recognized in the industry.',
    rating: 5,
  },
];

/* ─── Page ────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-white dark:bg-black">

      {/* ============ HERO ============ */}
      <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden">
        {/* Ambient gradient orbs */}
        <div className="absolute top-[5%] right-[5%] w-[700px] h-[700px] rounded-full blur-[160px] animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(0,128,248,0.2) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[5%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[140px] animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(112,40,192,0.16) 0%, transparent 70%)', animationDelay: '1.5s' }} />
        <div className="absolute top-[50%] left-[25%] w-[400px] h-[400px] rounded-full blur-[120px] animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(0,128,248,0.1) 0%, transparent 70%)', animationDelay: '3s' }} />

        <div className="absolute inset-0 bg-grid opacity-30" />
        <FloatingRing className="w-[350px] h-[350px] top-[10%] right-[15%]" delay={0.5} />
        <FloatingRing className="w-[200px] h-[200px] bottom-[15%] left-[8%]" delay={0.8} />
        <FloatingRing className="w-[120px] h-[120px] top-[25%] left-[20%]" delay={1.1} />

        <div className="absolute inset-0 hidden lg:block">
          {[
            { x: 10, y: 20, d: 0 }, { x: 85, y: 15, d: 0.5 }, { x: 70, y: 70, d: 1 },
            { x: 20, y: 80, d: 1.5 }, { x: 90, y: 45, d: 2 }, { x: 45, y: 10, d: 0.3 },
            { x: 60, y: 85, d: 1.2 }, { x: 5, y: 50, d: 2.2 }, { x: 75, y: 30, d: 0.8 },
          ].map((dot, i) => <Dot key={i} x={dot.x} y={dot.y} delay={dot.d} />)}
        </div>

        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/60 to-transparent" />

        {/* Hero Content — Centered */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 w-full text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col items-center">
            {/* Status badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.07] border border-white/[0.1] backdrop-blur-md mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
              </span>
              <span className="text-primary-600 dark:text-primary-400 text-sm font-medium tracking-wide">#1 Choice for Virtual Internship Programs</span>
            </motion.div>

            {/* Headline with typewriter */}
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-extrabold text-slate-950 dark:text-white leading-[1.06] tracking-tight max-w-4xl">
              Where Learning Turns Into
              <br />
              <TypewriterText
                words={typewriterWords}
                speed={90}
                deleteSpeed={40}
                pauseDuration={2200}
              />
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeUp} className="mt-7 text-lg sm:text-xl text-slate-500 dark:text-white/60 leading-relaxed max-w-2xl font-normal">
              Kickstart your career with our free virtual internship program. Work on real projects, gain practical skills and earn an industry-recognized certificate.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/internships">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition duration-400" />
                  <div className="relative flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-base font-semibold rounded-2xl hover:shadow-glow-lg transition-all duration-300 cursor-pointer">
                    Start Your Internship
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
              <Link to="/verify">
                <div className="flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-white/[0.15] text-slate-600 bg-primary-500 text-white dark:text-white/80 text-base font-semibold hover:bg-slate-100 dark:bg-white/[0.06] hover:border-white/[0.25] transition-all duration-300 cursor-pointer backdrop-blur-sm">
                  <QrCode className="w-5 h-5" /> Verify Certificate
                </div>
              </Link>
              <Link to="/offer-letter">
                <div className="flex items-center gap-2 px-6 py-4 text-slate-800 dark:text-white/50 text-sm font-medium hover:text-slate-900 dark:hover:text-white transition-all duration-300 cursor-pointer">
                  <Download className="w-4 h-4" /> Download Offer Letter
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Live Platform Metrics ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-8"
          >
            <p className="text-slate-400 dark:text-white/30 text-xs sm:text-sm text-center font-medium tracking-widest uppercase">
              Real-time platform growth powered by active learners completing assignments
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {liveMetrics.map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] backdrop-blur-sm hover:bg-slate-100 dark:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 group"
              >
                <div className="w-10 h-10 mx-auto bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-xl flex items-center justify-center mb-3 group-hover:from-primary-500/25 group-hover:to-secondary-500/25 transition-all">
                  <metric.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  <AnimatedCounter target={metric.value} suffix={metric.suffix} />
                </p>
                <p className="text-sm font-semibold text-slate-100 dark:text-white/70 mt-1">{metric.label}</p>
                <p className="text-xs text-slate-400 dark:text-white/30 mt-1 hidden sm:block">{metric.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TRUSTED BY ============ */}
      <section className="py-20 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Section>
            <p className="text-slate-400 dark:text-white/30 text-xs font-semibold tracking-widest uppercase mb-3">
              Trusted by Students Worldwide
            </p>
            <p className="text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg font-normal mb-10">
              NexoraMind has helped learners build skills, complete real projects, and grow their careers across multiple countries.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {['React.js', 'Node.js', 'Python', 'AWS', 'Docker', 'Figma'].map((tech, i) => (
                <span key={i} className="text-xl font-extrabold text-slate-50 dark:text-white/15 hover:text-primary-600 dark:text-primary-400 transition-colors duration-300 cursor-default select-none">{tech}</span>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="py-24 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
                <Zap className="w-3 h-3" /> Why NexoraMind
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Empowering the Next Generation of Tech Leaders
              </h2>
              <p className="mt-4 text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg font-normal">
                Through practical learning and industry-aligned internships.
              </p>
            </div>
          </Section>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <div className="p-7 h-full rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-2xl flex items-center justify-center mb-5 group-hover:from-primary-500/25 group-hover:to-secondary-500/25 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="font-bold text-slate-950 dark:text-white mb-2 text-lg tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-white/40 leading-relaxed font-normal">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TECH DOMAINS ============ */}
      <section className="py-24 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
                <Target className="w-3 h-3" /> Tech Domains
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Certifications Across the Stack
              </h2>
              <p className="mt-4 text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg font-normal">
                From frontend to cloud infrastructure, we cover every layer.
              </p>
            </div>
          </Section>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {domains.map((domain, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <div className="group flex items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 cursor-pointer">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-xl flex items-center justify-center shrink-0 group-hover:from-primary-500/25 group-hover:to-secondary-500/25 group-hover:scale-110 transition-all duration-300">
                    <domain.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-950 dark:text-white text-sm block">{domain.label}</span>
                    <span className="text-xs text-slate-400 dark:text-white/30 font-medium">{domain.desc}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-50 dark:text-white/15 ml-auto shrink-0 opacity-0 group-hover:opacity-100 group-hover:text-primary-600 dark:text-primary-400 transition-all duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-24 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
                <Sparkles className="w-3 h-3" /> How It Works
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                From Learning to Certified
              </h2>
              <p className="mt-4 text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg font-normal">
                Four simple steps to advance your career.
              </p>
            </div>
          </Section>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-primary-500/10 via-primary-500/30 to-secondary-500/10" />

            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="text-center relative"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-lg shadow-primary-500/25 hover:scale-110 transition-transform duration-300">
                  <span className="font-bold text-xl text-white dark:text-white">{item.step}</span>
                </div>
                <h3 className="font-bold text-slate-950 dark:text-white mb-1 tracking-tight">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-white/40 font-normal">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-24 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
                <Quote className="w-3 h-3" /> Testimonials
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                What Our Interns Say
              </h2>
              <p className="mt-4 text-slate-500 dark:text-white/40 max-w-2xl mx-auto text-lg font-normal">
                Hear from students who have transformed their careers with NexoraMind.
              </p>
            </div>
          </Section>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="p-7 h-full flex flex-col rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-black dark:text-white/50 text-sm leading-relaxed flex-1 font-normal">"{t.text}"</p>

                  {/* Author */}
                  <div className="mt-5 pt-5 border-t border-slate-200 dark:border-white/[0.06] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white dark:text-white text-sm font-bold shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{t.name}</p>
                      <p className="text-xs text-black dark:text-white/30 truncate">{t.role} · {t.domain}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative py-28 overflow-hidden border-t border-slate-200 dark:border-white/[0.06]">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-secondary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary-500/8 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Section>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 dark:text-white leading-tight tracking-tight">
              Ready to Get{' '}
              <span style={{
                background: 'linear-gradient(135deg, #59a3ff, #7028C0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Certified</span>?
            </h2>
            <p className="mt-6 text-lg text-slate-800 dark:text-white/50 max-w-xl mx-auto font-normal">
              Join hundreds of developers who have earned their certification through NexoraMind Tech.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/internships">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition duration-400" />
                  <div className="relative flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-base font-semibold rounded-2xl hover:shadow-glow-lg transition-all duration-300 cursor-pointer">
                    Start Your Internship
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
              <Link to="/verify">
                <div className="flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-white/[0.15] bg-primary-500 text-white dark:text-white/80 text-base font-semibold hover:bg-slate-100 dark:bg-white/[0.06] hover:border-white/[0.25] transition-all duration-300 cursor-pointer backdrop-blur-sm">
                  <QrCode className="w-5 h-5" /> Verify Certificate
                </div>
              </Link>
            </div>
          </Section>
        </div>
      </section>
    </div>
  );
}
