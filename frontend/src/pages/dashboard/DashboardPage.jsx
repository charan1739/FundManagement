import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Clock, CheckCircle, BarChart3, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getRecentActivity, getChartData, getRecentTransactions } from '../../api/dashboard';
import StatCard from '../../components/ui/StatCard';
import ActivityFeed from '../../components/ActivityFeed';
import TransactionTable from '../../components/TransactionTable';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CATEGORY_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'];

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, activityRes, chartRes, txnRes] = await Promise.all([
          getDashboardStats(), getRecentActivity(), getChartData(), getRecentTransactions(),
        ]);
        setStats(statsRes.data.data);
        setActivity(activityRes.data.data);
        setChartData(chartRes.data.data);
        setTransactions(txnRes.data.data);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Process monthly chart data
  const processedMonthly = React.useMemo(() => {
    if (!chartData?.monthlyData) return [];
    const map = {};
    chartData.monthlyData.forEach(({ _id, total }) => {
      const key = `${MONTH_NAMES[_id.month - 1]} ${_id.year}`;
      if (!map[key]) map[key] = { name: key, credit: 0, debit: 0 };
      map[key][_id.type] = total;
    });
    return Object.values(map);
  }, [chartData]);

  const categoryData = chartData?.categoryData?.map((c, i) => ({
    name: c._id?.replace('_', ' ') || 'Other',
    value: c.total,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's your financial overview</p>
        </div>
        <button onClick={() => navigate('/projects/new')} className="btn-primary flex items-center gap-2 hidden sm:flex">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Projects" value={stats?.totalProjects || 0} icon={BarChart3} color="indigo" loading={loading} />
        <StatCard title="Total Balance" value={stats?.totalBalance || 0} icon={Wallet} color="emerald" currency loading={loading} />
        <StatCard title="Pending" value={stats?.pendingRequests || 0} icon={Clock} color="amber" loading={loading} />
        <StatCard title="Approved" value={stats?.approvedRequests || 0} icon={TrendingUp} color="violet" loading={loading} />
        <StatCard title="Completed" value={stats?.completedTransfers || 0} icon={CheckCircle} color="emerald" loading={loading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="section-title mb-4">Monthly Overview</h3>
          {processedMonthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={processedMonthly} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="debitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', color: '#F1F5F9' }}
                  formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} />
                <Area type="monotone" dataKey="credit" stroke="#10B981" strokeWidth={2} fill="url(#creditGrad)" name="Funds Added" />
                <Area type="monotone" dataKey="debit" stroke="#F43F5E" strokeWidth={2} fill="url(#debitGrad)" name="Funds Spent" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94A3B8' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-slate-500 text-sm">No chart data yet</div>
          )}
        </div>

        {/* Category Pie */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Category Breakdown</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} strokeWidth={0}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', color: '#F1F5F9' }}
                    formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categoryData.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                      <span className="text-slate-400 capitalize">{c.name}</span>
                    </div>
                    <span className="text-slate-300">₹{c.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm">No expenses yet</div>
          )}
        </div>
      </div>

      {/* Bottom: Activity + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="section-title mb-4">Recent Activity</h3>
          <ActivityFeed activities={activity} loading={loading} />
        </div>
        <div className="card p-6">
          <h3 className="section-title mb-4">Recent Transactions</h3>
          <TransactionTable transactions={transactions} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
