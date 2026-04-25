import { useState, useEffect, useCallback } from 'react';
import {
  Users, ShoppingCart, Package, IndianRupee, TrendingUp, Shield, ShieldCheck,
  ShieldAlert, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle,
  BarChart3, UserCheck, UserX, MapPin, Clock, Store, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'sellers', label: 'Seller Verification', icon: ShieldCheck },
];

const PIE_COLORS = ['#C35831', '#F59E0B', '#15803D', '#6366F1', '#EC4899', '#8B5CF6'];

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </span>
        <TrendingUp className="w-4 h-4 text-gray-300" />
      </div>
      <p className="font-display text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function OverviewTab({ data }) {
  if (!data) return <p className="text-center text-gray-400 py-12">No data available</p>;

  const { stats, ordersByStatus, topCategories, monthlyRevenue, topStates } = data;

  const chartData = (monthlyRevenue || []).filter(m => m.month).map(m => ({
    month: (() => { try { return new Date(m.month).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }); } catch { return m.month; } })(),
    revenue: Number(m.revenue) || 0,
    orders: Number(m.orders) || 0,
  }));

  const categoryData = (topCategories || []).map((c, i) => ({
    name: c.category, value: Number(c.count),
  }));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${Number(stats?.total_revenue || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee} color="text-emerald-600 bg-emerald-100" />
        <StatCard label="Total Orders" value={stats?.total_orders || 0}
          icon={ShoppingCart} color="text-blue-600 bg-blue-100" />
        <StatCard label="Total Users" value={stats?.total_users || 0}
          icon={Users} color="text-terracotta-600 bg-terracotta-100"
          sub={`${stats?.total_sellers || 0} sellers · ${stats?.total_buyers || 0} buyers`} />
        <StatCard label="Active Products" value={stats?.total_products || 0}
          icon={Package} color="text-saffron-600 bg-saffron-100" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Revenue */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Monthly Revenue</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontFamily: 'Outfit' }} />
                <Bar dataKey="revenue" fill="#C35831" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Categories Pie */}
        <div className="card p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Top Categories</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontFamily: 'Outfit' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categoryData.slice(0, 5).map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-gray-600 truncate flex-1">{c.name}</span>
                    <span className="text-gray-400 font-medium">{c.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Order Status breakdown + Top States */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {(ordersByStatus || []).map(o => {
              const pct = stats?.total_orders ? Math.round(o.count / stats.total_orders * 100) : 0;
              return (
                <div key={o.status} className="flex items-center gap-3">
                  <span className="w-20 text-xs font-medium text-gray-600 capitalize">{o.status}</span>
                  <div className="flex-1 h-2 bg-cream-100 rounded-full overflow-hidden">
                    <div className="h-full bg-terracotta-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs text-gray-500">{o.count}</span>
                </div>
              );
            })}
            {(!ordersByStatus || ordersByStatus.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Top States</h3>
          <div className="space-y-2.5">
            {(topStates || []).slice(0, 8).map((s, i) => (
              <div key={s.state} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-cream-100 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="flex-1 text-sm text-gray-700">{s.state}</span>
                <span className="text-sm font-medium text-gray-800">{s.count} products</span>
              </div>
            ))}
            {(!topStates || topStates.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await dashboardAPI.getUsers({ page, limit, search: search || undefined, role: role || undefined });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleUser = async (id) => {
    try {
      await dashboardAPI.toggleUser(id);
      toast.success('User updated');
      fetchUsers();
    } catch {
      toast.error('Action failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10" placeholder="Search users by name or email..." />
        </div>
        <div className="flex gap-1.5">
          {['', 'buyer', 'seller', 'admin'].map(r => (
            <button key={r} onClick={() => { setRole(r); setPage(1); }}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${r === role ? 'bg-terracotta-500 text-white' : 'bg-cream-100 text-gray-600 hover:bg-cream-200'}`}>
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50/50">
                  <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-center py-3.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-center py-3.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                  <th className="text-center py-3.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-cream-100 hover:bg-cream-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`badge ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : u.role === 'seller' ? 'badge-terracotta' : 'bg-cream-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-gray-500 text-xs hidden md:table-cell">
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {u.is_active !== false ? (
                        <span className="badge badge-green gap-1"><UserCheck className="w-3 h-3" /> Active</span>
                      ) : (
                        <span className="badge bg-red-100 text-red-600 gap-1"><UserX className="w-3 h-3" /> Blocked</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button onClick={() => toggleUser(u.id)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            u.is_active !== false ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}>
                          {u.is_active !== false ? 'Block' : 'Unblock'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-cream-200 bg-cream-50/30">
              <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-cream-200 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-cream-200 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SellersTab() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await dashboardAPI.getUsers({ role: 'seller', limit: 50 });
      setSellers(data.users || []);
    } catch {
      toast.error('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSellers(); }, [fetchSellers]);

  const verify = async (id, status, name) => {
    const action = status === 'verified' ? 'verify' : 'reject';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} seller "${name}"?`)) return;
    try {
      await dashboardAPI.verifySeller(id, { status });
      toast.success(`Seller ${status}`);
      fetchSellers();
    } catch {
      toast.error('Verification failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  const pending = sellers.filter(s => s.verification === 'pending' || !s.verification);
  const verified = sellers.filter(s => s.verification === 'verified');
  const rejected = sellers.filter(s => s.verification === 'rejected');

  return (
    <div className="space-y-6">
      {/* Pending */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          Pending Verification
          {pending.length > 0 && <span className="badge bg-amber-100 text-amber-700">{pending.length}</span>}
        </h3>
        {pending.length === 0 ? (
          <div className="card p-8 text-center text-sm text-gray-400">No pending verifications</div>
        ) : (
          <div className="space-y-3">
            {pending.map(s => (
              <div key={s.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{s.business_name || s.name}</p>
                  <p className="text-sm text-gray-500">{s.email}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {s.district || '-'}, {s.state || '-'}
                    {s.craft_speciality && <> · <Store className="w-3 h-3 ml-1" /> {s.craft_speciality}</>}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => verify(s.id, 'verified', s.business_name || s.name)}
                    className="btn-primary text-xs py-2 px-4 gap-1"><CheckCircle className="w-3.5 h-3.5" /> Approve</button>
                  <button onClick={() => verify(s.id, 'rejected', s.business_name || s.name)}
                    className="px-4 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors gap-1 inline-flex items-center">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          Verified Sellers
          <span className="badge badge-green">{verified.length}</span>
        </h3>
        {verified.length === 0 ? (
          <div className="card p-8 text-center text-sm text-gray-400">No verified sellers yet</div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cream-200 bg-cream-50/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Speciality</th>
                    <th className="text-center py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {verified.map(s => (
                    <tr key={s.id} className="border-b border-cream-100">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-800">{s.business_name || s.name}</p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </td>
                      <td className="py-3 px-3 text-gray-500 text-sm hidden md:table-cell">{s.district}, {s.state}</td>
                      <td className="py-3 px-3 text-gray-500 text-sm hidden sm:table-cell">{s.craft_speciality || '-'}</td>
                      <td className="py-3 px-3 text-center"><span className="badge badge-green">Verified</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Rejected */}
      {rejected.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-400" />
            Rejected
            <span className="badge bg-gray-100 text-gray-500">{rejected.length}</span>
          </h3>
          <div className="card overflow-hidden divide-y divide-cream-100">
            {rejected.map(s => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">{s.business_name || s.name}</p>
                  <p className="text-xs text-gray-400">{s.email}</p>
                </div>
                <button onClick={() => verify(s.id, 'verified', s.business_name || s.name)}
                  className="text-xs text-terracotta-600 hover:underline">Re-approve</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getAdmin().then(r => setData(r.data))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">Admin Panel</p>
        <h1 className="section-heading text-2xl">Platform Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-cream-200">
        {TABS.map(t => {
          const isActive = t.key === tab;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive ? 'border-terracotta-500 text-terracotta-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && <OverviewTab data={data} />}
      {tab === 'users' && <UsersTab />}
      {tab === 'sellers' && <SellersTab />}
    </div>
  );
}
