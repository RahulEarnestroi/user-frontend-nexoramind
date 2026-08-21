import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Building2, Mail, Shield } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    organizationName: 'NexoraMind Tech',
    organizationEmail: 'admin@nexoramind.com',
    organizationUrl: 'https://nexoramind.space',
    emailFrom: 'noreply@nexoramind.com',
    certificatePrefix: 'NM',
  });

  const handleSave = () => {
    console.log('Settings saved:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Platform configuration</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-slate-900">Organization</h3>
          </div>
          <div className="space-y-4">
            <Input
              label="Organization Name"
              value={settings.organizationName}
              onChange={e => setSettings({ ...settings, organizationName: e.target.value })}
            />
            <Input
              label="Contact Email"
              type="email"
              value={settings.organizationEmail}
              onChange={e => setSettings({ ...settings, organizationEmail: e.target.value })}
            />
            <Input
              label="Website URL"
              value={settings.organizationUrl}
              onChange={e => setSettings({ ...settings, organizationUrl: e.target.value })}
            />
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-slate-900">Email</h3>
          </div>
          <div className="space-y-4">
            <Input
              label="From Email"
              type="email"
              value={settings.emailFrom}
              onChange={e => setSettings({ ...settings, emailFrom: e.target.value })}
            />
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-slate-900">Certificate</h3>
          </div>
          <div className="space-y-4">
            <Input
              label="Certificate ID Prefix"
              value={settings.certificatePrefix}
              onChange={e => setSettings({ ...settings, certificatePrefix: e.target.value })}
            />
          </div>
        </Card>
      </motion.div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
