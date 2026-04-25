import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, XCircle, Clock, Truck, CheckCircle, AlertCircle, ShoppingBag, Wrench } from 'lucide-react';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

const STEPS = [
  { key: 'pending',    icon: ShoppingBag, label: 'Ordered'    },
  { key: 'confirmed',  icon: Package,     label: 'Confirmed'  },
  { key: 'processing', icon: Wrench,      label: 'Processing' },
  { key: 'shipped',    icon: Truck,       label: 'Shipped'    },
  { key: 'delivered',  icon: CheckCircle, label: 'Delivered'  },
];

const STATUS_META = {
  pending:    { color: 'bg-amber-100 text-amber-700',   icon: Clock,         label: 'Pending'    },
  confirmed:  { color: 'bg-blue-100 text-blue-700',     icon: Package,       label: 'Confirmed'  },
  processing: { color: 'bg-purple-100 text-purple-700', icon: Wrench,        label: 'Processing' },
  shipped:    { color: 'bg-indigo-100 text-indigo-700', icon: Truck,         label: 'Shipped'    },
  delivered:  { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Delivered'  },
  cancelled:  { color: 'bg-red-100 text-red-700',       icon: XCircle,       label: 'Cancelled'  },
};

function OrderTimeline({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-red-50 rounded-xl text-red-600 text-sm">
        <XCircle className="w-5 h-5 shrink-0" />
        <span className="font-medium">This order was cancelled</span>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex(s => s.key === status);

  return (
    <div className="py-4">
      <div className="relative flex items-start justify-between">
        {/* connecting line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-cream-200 z-0" />
        <div
          className="absolute top-4 left-4 h-0.5 bg-terracotta-400 z-0 transition-all duration-700"
          style={{ width: `${Math.max(0, (currentIdx / (STEPS.length - 1)) * 100)}%`, right: 'auto' }}
        />

        {STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          const future = idx > currentIdx;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                done    ? 'bg-terracotta-500 text-white shadow-md' :
                active  ? 'bg-terracotta-500 text-white shadow-lg ring-4 ring-terracotta-100 scale-110' :
                          'bg-cream-200 text-gray-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`hidden sm:block text-[10px] text-center leading-tight font-medium ${
                done || active ? 'text-terracotta-600' : 'text-gray-400'
              }`}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BuyerOrders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    orderAPI.getAll().then(r => setOrders(r.data.orders || r.data || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderAPI.cancel(id, { reason: 'Buyer requested cancellation' });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
      toast.success('Order cancelled');
    } catch (err) { toast.error(err.response?.data?.error || 'Cancel failed'); }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="section-heading mb-2">{t('myOrdersTitle')}</h1>
      <p className="text-gray-500 text-sm mb-8">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${filter === f ? 'bg-terracotta-500 text-white' : 'bg-white border border-cream-200 text-gray-600 hover:bg-cream-50'}`}>
            {f === 'all' ? `All (${orders.length})` : `${f} (${orders.filter(o => o.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No orders found</p>
          <Link to="/products" className="btn-primary mt-4 text-sm inline-block">{t('continueShopping')}</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const s = STATUS_META[order.status] || STATUS_META.pending;
            const StatusIcon = s.icon;
            const expanded = expandedId === order.id;

            return (
              <div key={order.id} className="card overflow-hidden">
                {/* Header */}
                <button onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-cream-50/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <StatusIcon className={`w-5 h-5 shrink-0 ${s.color.split(' ')[1]}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-800">{order.order_number}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`badge ${s.color}`}>{s.label}</span>
                    <span className="font-display font-bold text-gray-800">₹{Number(order.total).toLocaleString('en-IN')}</span>
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded content */}
                {expanded && (
                  <div className="border-t border-cream-100 bg-cream-50/30 animate-fade-in">
                    {/* Order tracking timeline */}
                    <div className="px-5 pt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t('trackOrder')}</p>
                      <OrderTimeline status={order.status} />
                    </div>

                    {/* Items */}
                    <div className="px-5 pb-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t('orderDetails')}</p>
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-cream-100 overflow-hidden shrink-0">
                            <img
                              src={item.image || `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#C35831" width="100" height="100"/><text x="50" y="55" fill="#FEF7ED" font-family="serif" font-size="28" text-anchor="middle">🏺</text></svg>')}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{item.product_name}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
                          </div>
                          <span className="text-sm font-semibold">₹{Number(item.total).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="flex items-center justify-between px-5 py-4 border-t border-cream-200">
                      <div className="text-xs text-gray-400 space-y-0.5">
                        {order.shipping_address && (() => {
                          try {
                            const a = typeof order.shipping_address === 'string'
                              ? JSON.parse(order.shipping_address) : order.shipping_address;
                            return <p>📍 {a.city}, {a.state} - {a.pincode}</p>;
                          } catch { return null; }
                        })()}
                        {order.payment_status && (
                          <p>💳 Payment: <span className={`capitalize font-medium ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.payment_status}</span></p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="font-bold text-gray-900">Total: ₹{Number(order.total).toLocaleString('en-IN')}</span>
                        {order.status === 'pending' && (
                          <button onClick={() => handleCancel(order.id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium">
                            <XCircle className="w-3.5 h-3.5" /> {t('cancelOrder')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
