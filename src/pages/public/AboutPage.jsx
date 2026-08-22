import { motion } from 'framer-motion';
import { Shield, Globe, Target, Heart, Award, Briefcase, Zap } from 'lucide-react';
import Card from '../../components/ui/Card';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AboutPage() {
  return (
    <div className="py-20 bg-black min-h-screen" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-400 text-xs font-semibold mb-4 border border-primary-500/15 tracking-wide uppercase">
            <Zap className="w-3 h-3" /> About Us
          </span>
          <h1 className="text-4xl font-bold text-white tracking-tight">About NexoraMind Tech</h1>
          <p className="mt-4 text-lg text-white/40 max-w-2xl mx-auto leading-relaxed font-normal">
            Building the most trusted certification and internship platform for tech professionals worldwide.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Target, title: 'Our Mission', desc: 'To provide accessible, verifiable, and industry-recognized certifications and internship opportunities that help tech professionals prove their skills.' },
            { icon: Shield, title: 'Trust & Security', desc: 'Every certificate is cryptographically verified and cannot be forged. Our verification system ensures complete trust.' },
            { icon: Briefcase, title: 'Internships', desc: 'We connect certified professionals with top internship opportunities, bridging the gap between learning and real-world experience.' },
            { icon: Award, title: 'Quality Standards', desc: 'Rigorous assessment standards ensure every certification represents genuine skill and deep knowledge.' },
            { icon: Globe, title: 'Global Reach', desc: 'Our certifications are recognized worldwide, opening doors to global career opportunities.' },
            { icon: Heart, title: 'Community', desc: 'A growing community of certified tech professionals who have validated their expertise across multiple domains.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Card hover className="p-6 h-full">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-2xl flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary-400" />
                </div>
                <h3 className="font-bold text-white mb-2 tracking-tight">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed font-normal">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
