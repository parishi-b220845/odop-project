import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Cart() {
  const { items, summary, loading, fetchCart, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (loading) return <LoadingSpinner />;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">🛒</span>
        <h2 className="font-display text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Discover amazing crafts from artisans across India</p>
        <Link to="/products" className="btn-primary mt-6 gap-2"><ShoppingBag className="w-4 h-4" />Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-heading text-2xl">Shopping Cart ({summary.itemCount} items)</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700">Clear Cart</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="card flex gap-4 p-4">
              <div className="w-24 h-24 bg-cream-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-3xl">🏺</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.slug}`} className="font-medium text-gray-900 text-sm hover:text-terracotta-600 line-clamp-2">{item.name}</Link>
                <p className="text-xs text-gray-500 mt-0.5">by {item.business_name || item.seller_name}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-cream-200 rounded-lg">
                    <button onClick={() => updateItem(item.id, item.quantity - 1)} className="p-1.5 hover:bg-cream-50"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, item.quantity + 1)} className="p-1.5 hover:bg-cream-50"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{Number(item.item_total).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">₹{Number(item.effective_price).toLocaleString('en-IN')} each</p>
                  </div>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 self-start"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h3 className="font-display text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{Number(summary.subtotal).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{summary.shipping === 0 ? <span className="text-emerald-600">FREE</span> : `₹${summary.shipping}`}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax (GST 5%)</span><span>₹{Number(summary.tax).toLocaleString('en-IN')}</span></div>
              <hr className="border-cream-200" />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{Number(summary.total).toLocaleString('en-IN')}</span></div>
            </div>

            {summary.shipping > 0 && (
              <div className="mt-4 p-3 bg-saffron-50 rounded-lg">
                <p className="text-xs text-saffron-700 flex items-center gap-1"><Truck className="w-3.5 h-3.5" />Add ₹{999 - summary.subtotal} more for free shipping</p>
              </div>
            )}

            <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-5 gap-2">Proceed to Checkout <ArrowRight className="w-4 h-4" /></button>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5" />Secure payment via Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
