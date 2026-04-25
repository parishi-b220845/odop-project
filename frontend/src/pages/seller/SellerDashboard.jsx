import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, IndianRupee, Star, TrendingUp, Clock, Eye } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SellerDashboard() {
  const { user, sellerProfile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getSeller().then(r => setData(r.data))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-20 text-gray-400">Failed to load dashboard</div>;

  const { stats, recentOrders, topProducts, monthlyRevenue } = data;
  const chartData = (monthlyRevenue || []).map(m => ({
    month: new Date(m.month).toLocaleDateString('en-IN', { month: 'short' }),
    revenue: Number(m.revenue) || 0,
    orders: Number(m.orders) || 0,
  }));

  const statCards = [
    { label: 'Total Revenue', value: `₹${Number(stats?.total_revenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Total Orders', value: stats?.total_orders || 0, icon: ShoppingCart, color: 'text-blue-600 bg-blue-100' },
    { label: 'Active Products', value: stats?.total_products || 0, icon: Package, color: 'text-terracotta-600 bg-terracotta-100' },
    { label: 'Avg Rating', value: Number(stats?.avg_rating || 0).toFixed(1), icon: Star, color: 'text-saffron-600 bg-saffron-100' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-gray-500">Welcome back,</p>
          <h1 className="section-heading">{sellerProfile?.business_name || user?.name}</h1>
          {sellerProfile && (
            <p className="text-sm text-gray-400 mt-1">{sellerProfile.district}, {sellerProfile.state}
              <span className={`badge ml-2 ${sellerProfile.verification === 'verified' ? 'badge-green' : 'badge-saffron'}`}>{sellerProfile.verification}</span>
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Link to="/seller/products" className="btn-outline text-sm">Manage Products</Link>
          <Link to="/seller/orders" className="btn-primary text-sm">View Orders</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </span>
              <TrendingUp className="w-4 h-4 text-gray-300" />
            </div>
            <p className="font-display text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Revenue Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C35831" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#C35831" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)', fontFamily: 'Outfit' }} />
                <Area type="monotone" dataKey="revenue" stroke="#C35831" strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center gap-2">
              <TrendingUp className="w-10 h-10 text-gray-200" />
              <p className="text-gray-400 font-medium text-sm">No revenue data yet</p>
              <p className="text-gray-300 text-xs">Start selling to see your earnings chart</p>
              <Link to="/seller/products" className="mt-2 text-xs text-terracotta-500 hover:underline font-medium">Add your first product →</Link>
            </div>
          )}
        </div>

        {/* Pending orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Recent Orders</h3>
            {stats?.pending_orders > 0 && (
              <span className="badge bg-amber-100 text-amber-700">{stats.pending_orders} pending</span>
            )}
          </div>
          <div className="space-y-3">
            {(recentOrders || []).slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg bg-cream-50/50">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{o.product_name}</p>
                  <p className="text-xs text-gray-400">Qty {o.quantity} · {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
                <span className="text-sm font-semibold">₹{Number(o.item_total).toLocaleString('en-IN')}</span>
              </div>
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="card p-6 mt-6">
        <h3 className="font-display text-lg font-semibold mb-4">Top Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200">
                <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              </tr>
            </thead>
            <tbody>
              {(topProducts || []).map(p => (
                <tr key={p.slug} className="border-b border-cream-100 hover:bg-cream-50/50">
                  <td className="py-3">
                    <Link to={`/products/${p.slug}`} className="font-medium text-gray-800 hover:text-terracotta-600">{p.name}</Link>
                  </td>
                  <td className="py-3 text-center text-gray-600">{p.order_count || 0}</td>
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-saffron-600">
                      <Star className="w-3.5 h-3.5 fill-current" /> {Number(p.avg_rating || 0).toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 text-center text-gray-500"><Eye className="w-3.5 h-3.5 inline mr-1" />{p.view_count || 0}</td>
                  <td className="py-3 text-right font-semibold">₹{Number(p.price).toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right">
                    <span className={`badge ${p.stock > 10 ? 'badge-green' : p.stock > 0 ? 'badge-saffron' : 'bg-red-100 text-red-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!topProducts || topProducts.length === 0) && (
            <p className="text-sm text-gray-400 text-center py-8">No products listed yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
