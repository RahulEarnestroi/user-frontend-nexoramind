import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Clock, BarChart3 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { certifications } from '../../data/mockData';
import { formatDateShort } from '../../lib/utils';

export default function AdminCertificationsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', duration: '', passingScore: 70 });

  const handleSave = () => {
    if (editing) {
      const idx = certifications.findIndex(c => c.id === editing.id);
      if (idx !== -1) certifications[idx] = { ...certifications[idx], ...form };
    } else {
      certifications.push({
        id: 'c' + Date.now(),
        ...form,
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        status: 'ACTIVE',
        skills: [],
        createdAt: new Date().toISOString(),
      });
    }
    setShowModal(false);
    setEditing(null);
    setForm({ name: '', description: '', duration: '', passingScore: 70 });
  };

  const handleEdit = (cert) => {
    setEditing(cert);
    setForm({ name: cert.name, description: cert.description, duration: cert.duration, passingScore: cert.passingScore });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Certification Programs</h1>
          <p className="text-slate-600 mt-1">Manage certification programs</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', description: '', duration: '', passingScore: 70 }); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Add Program
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {certifications.map((cert, i) => (
          <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card hover className="p-6">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={cert.status === 'ACTIVE' ? 'success' : 'default'}>{cert.status}</Badge>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(cert)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Edit className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{cert.name}</h3>
              <p className="text-sm text-slate-600 line-clamp-2 mb-3">{cert.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {cert.duration}</div>
                <div className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Pass: {cert.passingScore}%</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {cert.skills.slice(0, 3).map(s => (
                  <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{s}</span>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Program' : 'Add Program'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Certification name" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 2 hours" />
            <Input label="Passing Score (%)" type="number" value={form.passingScore} onChange={e => setForm({ ...form, passingScore: Number(e.target.value) })} />
          </div>
          <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
}
