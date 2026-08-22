import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, Globe } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => { e.preventDefault(); console.log('Contact form:', form); setSubmitted(true); };

  return (
    <div className="py-20 bg-white dark:bg-black min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-4 border border-primary-100 dark:border-primary-500/15 tracking-wide uppercase">
            <MessageSquare className="w-3 h-3" /> Get in Touch
          </span>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Contact Us</h1>
          <p className="mt-3 text-slate-500 dark:text-white/40 max-w-xl mx-auto font-normal">Have questions? We'd love to hear from you.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Mail, title: 'Email', desc: 'support@nexoramind.space' },
            { icon: MessageSquare, title: 'Response Time', desc: 'Within 24 hours' },
            { icon: Globe, title: 'Website', desc: 'nexoramind.space' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-6 text-center">
                <div className="w-11 h-11 mx-auto bg-gradient-to-br from-primary-500/15 to-secondary-500/15 rounded-2xl flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-white/40">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <Send className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                <p className="text-slate-500 dark:text-white/40 font-normal">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input label="Name" placeholder="Your name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <Input label="Email" type="email" placeholder="you@example.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <Input label="Subject" placeholder="How can we help?" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-600 dark:text-white/60">Message</label>
                  <textarea rows={5} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-900 dark:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder:text-slate-400 dark:placeholder:text-white/30 hover:border-slate-300 dark:hover:border-white/[0.15]" placeholder="Your message..." required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                </div>
                <Button type="submit" size="lg" className="w-full">Send Message</Button>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
