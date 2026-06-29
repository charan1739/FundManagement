import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FolderPlus } from 'lucide-react';
import { createProject } from '../../api/projects';
import toast from 'react-hot-toast';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name is required');
    setLoading(true);
    try {
      const { data } = await createProject(form);
      toast.success('Project created successfully!');
      navigate(`/projects/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Projects
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <FolderPlus size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Create New Project</h1>
            <p className="text-sm text-slate-400">Set up a new project fund</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Project Name *</label>
            <input
              id="project-name-input"
              type="text"
              className="input"
              placeholder="e.g. Mobile App Development"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              maxLength={150}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              id="project-desc-input"
              className="input resize-none"
              rows={4}
              placeholder="Brief description of the project..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={500}
            />
            <p className="text-xs text-slate-500 mt-1 text-right">{form.description.length}/500</p>
          </div>

          <div className="bg-dark-700 rounded-xl p-4 border border-dark-500">
            <p className="text-xs text-slate-400">
              <span className="text-indigo-400 font-medium">Auto-generated:</span> A unique project code will be assigned automatically (e.g. PFM-2024-ABC123)
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/projects')} className="btn-secondary flex-1">Cancel</button>
            <button id="create-project-submit" type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FolderPlus size={16} /> Create Project</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateProjectPage;
