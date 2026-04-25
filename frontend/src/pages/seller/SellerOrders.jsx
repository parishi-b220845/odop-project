import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Clock, Truck, CheckCircle, XCircle, ChevronDown,
  ChevronLeft, ChevronRight, Search, Filter, MapPin, User, IndianRupee
} from 'lucide-react';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',    icon: Clock,       color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400' },
  confirmed:   { label: 'Confirmed',  icon: CheckCircle, color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-400' },
  processing:  { label: 'Processing', icon: Package,     color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-400' },
  shipped:     { label: 'Shipped',    icon: Truck,       color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  delivered:   { label: 'Delivered',  icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
  cancelled:   { label: 'Cancelled',  icon: XCircle,     color: 'bg-red-100 text-red-700',       dot: 'bg-red-400' },
};

const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

function OrderRow({ order, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const nextStatus = NEXT_STATUS[order.status];

  const advance = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try {
      await orderAPI.updateStatus(order.id, { status: nextStatus });
      toast.success(`Order moved to ${STATUS_CONFIG[nextStatus].label}`);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="border-b border-cream-100 last:border-0">
      {/* Summary Row */}
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-cream-50/50 transition-colors text-left">
        <div className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
          <div className="col-span-2 sm:col-span-1 min-w-0">
            <p className="font-medium text-gray-800 text-sm truncate">{order.order_number || `#${order.id}`}</p>
            <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-sm text-gray-600 truncate">{order.buyer_name || 'Buyer'}</p>
            <p className="text-xs text-gray-400 truncate flex items-center gap-0.5"><MapPin className="w-3 h-3" />{order.city || order.state || '-'}</p>
          </div>
          <div>
            <span className={`badge ${sc.color} gap-1`}>
              <sc.icon className="w-3 h-3" /> {sc.label}
            </span>
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm">₹{Number(order.total || order.item_total || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400">{order.item_count || order.quantity || 1} item(s)</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3 animate-slide-down">
          {/* Order items */}
          <div className="bg-cream-50/60 rounded-xl p-4 space-y-2">
            {(order.items || [{ product_name: order.product_name, quantity: order.quantity, item_total: order.item_total }]).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Package className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate text-gray-700">{item.product_name || 'Product'}</span>
                  <span className="text-gray-400 shrink-0">×{item.quantity}</span>
                </div>
                <span className="font-medium shrink-0 ml-2">₹{Number(item.item_total || item.price * item.quantity || 0).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          {/* Shipping address */}
          {order.shipping_address && (
            <div className="text-xs text-gray-500">
              <span className="font-medium text-gray-600">Ship to:</span>{' '}
              {(() => {
                const a = typeof order.shipping_address === 'string'
                  ? JSON.parse(order.shipping_address) : order.shipping_address;
                return `${a.name || ''}, ${a.city || ''}, ${a.state || ''} - ${a.pincode || ''}`;
              })()}
            </div>
          )}

          {/* Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-gray-400">
              Order placed {new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {nextStatus && (
              <button onClick={advance} disabled={updating}
                className="btn-primary text-xs py-2 px-4 gap-1.5">
                {updating ? 'Updating...' : (
                  <>
                    Move to <span className="font-semibold">{STATUS_CONFIG[nextStatus].label}</span>
                  </>
                )}
              </button>
            )}
            {order.status === 'delivered' && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Completed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getSellerOrders({
        page, limit, status: status || undefined, search: search || undefined,
      });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalPages = Math.ceil(total / limit);
  const statuses = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="section-heading text-2xl">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{total} order{total !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/seller/dashboard" className="btn-ghost text-sm gap-1">
          <ChevronLeft className="w-4 h-4" /> Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10" placeholder="Search by order number or buyer..." />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map(s => {
            const label = s ? STATUS_CONFIG[s]?.label : 'All';
            const isActive = s === status;
            return (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                className={`shrink-0 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-terracotta-500 text-white' : 'bg-cream-100 text-gray-600 hover:bg-cream-200'
                }`}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {loading ? <LoadingSpinner /> : orders.length === 0 ? (
        <div className="card p-16 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders found</p>
          {status && <button onClick={() => setStatus('')} className="btn-ghost text-sm mt-3">Clear filter</button>}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {orders.map(o => (
            <OrderRow key={o.id} order={o} onUpdate={fetchOrders} />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-cream-200 bg-cream-50/30">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-cream-200 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-cream-200 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
