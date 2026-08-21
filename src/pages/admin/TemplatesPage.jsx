import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Copy, Trash2, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { templates as templateData } from '../../data/mockData';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(templateData);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '' });

  const handleSave = () => {
    if (editing) {
      setTemplates(templates.map(t => t.id === editing.id ? { ...t, name: form.name, updatedAt: new Date().toISOString() } : t));
    } else {
      setTemplates([...templates, {
        id: 't' + Date.now(),
        name: form.name,
        isDefault: false,
        configuration: { page: 'A4', orientation: 'landscape', elements: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }]);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ name: '' });
  };

  const handleDuplicate = (template) => {
    setTemplates([...templates, {
      ...template,
      id: 't' + Date.now(),
      name: template.name + ' (Copy)',
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this template?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleSetDefault = (id) => {
    setTemplates(templates.map(t => ({ ...t, isDefault: t.id === id })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
          <p className="text-slate-600 mt-1">Manage certificate templates</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: '' }); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Create Template
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template, i) => (
          <motion.div key={template.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card hover className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Edit className="w-6 h-6 text-primary-600" />
                </div>
                {template.isDefault && <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Default</Badge>}
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{template.configuration.orientation} • {template.configuration.elements.length} elements</p>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(template); setForm({ name: template.name }); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDuplicate(template)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Copy className="w-4 h-4" /></button>
                {!template.isDefault && (
                  <>
                    <button onClick={() => handleSetDefault(template.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Set default"><CheckCircle className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(template.id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-500"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Template' : 'Create Template'}>
        <div className="space-y-4">
          <Input label="Template Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="My Template" />
          <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
}
