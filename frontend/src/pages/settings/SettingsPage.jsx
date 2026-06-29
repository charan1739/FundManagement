import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { getSettings, updateSettings } from '../../api/reports';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState({ orgName: '', timezone: 'Asia/Kolkata', theme: 'dark', lowBalanceThreshold: 5000 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then(({ data }) => {
      const s = data.data;
      setSettings({ orgName: s.orgName, timezone: s.timezone, theme: s.theme, lowBalanceThreshold: s.lowBalanceThreshold });
    }).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card p-6 animate-pulse h-64" />;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <SettingsIcon size={22} className="text-indigo-400" />
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="label">Organization Name</label>
            <input type="text" className="input" value={settings.orgName}
              onChange={(e) => setSettings({ ...settings, orgName: e.target.value })} placeholder="e.g. Acme Technologies" />
          </div>

          <div>
            <label className="label">Currency</label>
            <div className="input opacity-60 cursor-not-allowed flex items-center gap-2">
              <span className="text-lg">₹</span><span>Indian Rupee (INR)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Currency is fixed to Indian Rupee</p>
          </div>

          <div>
            <label className="label">Timezone</label>
            <select className="input" value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>

          <div>
            <label className="label">Theme</label>
            <div className="flex gap-3">
              {['dark', 'light'].map((t) => (
                <button key={t} type="button" onClick={() => setSettings({ ...settings, theme: t })}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                    settings.theme === t ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-dark-500 text-slate-400'
                  }`}>
                  {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Low Balance Warning Threshold (₹)</label>
            <input type="number" className="input" value={settings.lowBalanceThreshold}
              onChange={(e) => setSettings({ ...settings, lowBalanceThreshold: Number(e.target.value) })} min="0" />
            <p className="text-xs text-slate-500 mt-1">Get notified when project balance falls below this amount</p>
          </div>

          <button id="save-settings-btn" type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16} />{saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
