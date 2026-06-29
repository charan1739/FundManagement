import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, FolderOpen } from 'lucide-react';
import { getProjects } from '../../api/projects';
import ProjectCard from '../../components/ProjectCard';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

const ProjectsListPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data } = await getProjects({ search, status: statusFilter, page, limit: 12 });
        setProjects(data.data);
        setPagination(data.pagination);
      } catch {
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchProjects, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{pagination.total || 0} projects total</p>
        </div>
        <button id="create-project-btn" onClick={() => navigate('/projects/new')} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-input"
            type="text"
            placeholder="Search projects..."
            className="input pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="input sm:w-40"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 bg-dark-800 rounded-2xl animate-pulse border border-dark-600" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => <ProjectCard key={project._id} project={project} />)}
        </div>
      ) : (
        <div className="text-center py-24 card">
          <FolderOpen size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-300">No projects found</p>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            {search ? `No projects matching "${search}"` : 'Create your first project to get started'}
          </p>
          {!search && (
            <button onClick={() => navigate('/projects/new')} className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Create Project
            </button>
          )}
        </div>
      )}

      <Pagination page={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
    </div>
  );
};

export default ProjectsListPage;
