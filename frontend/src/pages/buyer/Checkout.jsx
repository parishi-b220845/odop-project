import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, ShieldCheck, CheckCircle, Package, ChevronRight, Smartphone, Building2, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { orderAPI, authAPI, paymentAPI } from '../../services/api';
import { validators } from '../../utils/validators';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Review', 'Payment'];

const PAYMENT_METHODS = [
  { id: 'upi',      icon: Smartphone,  label: 'UPI',           desc: 'PhonePe, GPay, Paytm, BHIM' },
  { id: 'card',     icon: CreditCard,  label: 'Card',          desc: 'Credit / Debit Card' },
  { id: 'netbank',  icon: Building2,   label: 'Net Banking',   desc: 'All major banks' },
  { id: 'wallet',   icon: Wallet,      label: 'Wallet',        desc: 'Paytm, MobiKwik, Freecharge' },
  { id: 'cod',      icon: Package,     label: 'Cash on Delivery', desc: 'Pay when delivered' },
];

export default function Checkout() {
  const { user } = useAuth();
  const { items, summary, fetchCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [demoPayModal, setDemoPayModal] = useState(null); // { orderId, amount, orderNumber }
  const [newAddr, setNewAddr] = useState({
    name: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', label: 'Home',
  });

  useEffect(() => {
    fetchCart();
    authAPI.getProfile().then(({ data }) => {
      setAddresses(data.addresses || []);
      const def = data.addresses?.find(a => a.is_default);
      if (def) setSelectedAddress(def);
    });
  }, [fetchCart]);

  const handleAddAddress = async () => {
    if (!newAddr.name || !newAddr.addressLine1 || !newAddr.city || !newAddr.state) {
      toast.error('Please fill all required address fields');
      return;
    }
    if (!validators.phone(newAddr.phone)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    if (!validators.pincode(newAddr.pincode)) {
      toast.error('Pincode must be exactly 6 digits');
      return;
    }
    try {
      const { data } = await authAPI.addAddress({ ...newAddr, isDefault: true });
      setAddresses(prev => [...prev, data.address]);
      setSelectedAddress(data.address);
      setShowNewAddress(false);
      toast.success('Address saved');
    } catch { toast.error('Failed to save address'); }
  };

  const placeOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a shipping address'); return; }
    setPlacing(true);
    try {
      const shippingAddress = {
        name: selectedAddress.name, phone: selectedAddress.phone,
        addressLine1: selectedAddress.address_line1, addressLine2: selectedAddress.address_line2,
        city: selectedAddress.city, state: selectedAddress.state, pincode: selectedAddress.pincode,
      };
      const { data } = await orderAPI.create({ shippingAddress });

      if (paymentMethod === 'cod') {
        toast.success(`Order ${data.order.order_number} placed! Pay on delivery.`);
        navigate('/orders');
      } else {
        // Try real Razorpay first; fall back to demo modal if no key configured
        try {
          const { data: payData } = await paymentAPI.createOrder({ orderId: data.order.id });
          if (payData.keyId && window.Razorpay) {
            const rzp = new window.Razorpay({
              key: payData.keyId,
              amount: payData.amount,
              currency: payData.currency,
              order_id: payData.razorpayOrderId,
              name: 'ODOP Marketplace',
              description: `Order ${data.order.order_number}`,
              handler: async (response) => {
                await paymentAPI.verify(response);
                toast.success('Payment successful! Order confirmed.');
                navigate('/orders');
              },
              modal: { ondismiss: () => navigate('/orders') },
            });
            rzp.open();
          } else {
            setDemoPayModal({ orderId: data.order.id, amount: data.order.total, orderNumber: data.order.order_number });
            setPlacing(false);
            return;
          }
        } catch {
          setDemoPayModal({ orderId: data.order.id, amount: data.order.total, orderNumber: data.order.order_number });
          setPlacing(false);
          return;
        }
      }
    } catch (e) { toast.error(e.response?.data?.error || 'Order failed'); }
    setPlacing(false);
  };

  if (items.length === 0) { navigate('/cart'); return null; }

  const canProceedFromAddress = !!selectedAddress;

  // Demo payment modal (used when no Razorpay key is configured)
  const DemoPayModal = () => {
    const [processing, setProcessing] = useState(false);
    const simulatePay = async () => {
      setProcessing(true);
      await new Promise(r => setTimeout(r, 1800));
      try {
        await paymentAPI.verify({ demo: true, orderId: demoPayModal.orderId });
      } catch {}
      toast.success(`Payment of ₹${Number(demoPayModal.amount).toLocaleString('en-IN')} successful! Order confirmed.`);
      navigate('/orders');
    };
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
          <div className="bg-[#072654] px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#072654] font-bold text-sm">R</div>
            <div>
              <p className="text-white font-semibold text-sm">Razorpay Secure Checkout</p>
              <p className="text-blue-200 text-xs">Test Mode</p>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-xs mb-1">Order {demoPayModal.orderNumber}</p>
            <p className="text-2xl font-bold text-gray-900 mb-5">₹{Number(demoPayModal.amount).toLocaleString('en-IN')}</p>
            <div className="space-y-3 mb-5">
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">UPI ID</p>
                <input defaultValue="test@razorpay" className="w-full text-sm text-gray-700 outline-none" readOnly />
              </div>
              <p className="text-center text-xs text-gray-400">— or pay with —</p>
              <div className="flex gap-2 text-xs text-gray-500 justify-center">
                {['Cards', 'NetBanking', 'Wallets'].map(m => (
                  <span key={m} className="px-3 py-1.5 border border-gray-200 rounded-full hover:bg-gray-50 cursor-pointer">{m}</span>
                ))}
              </div>
            </div>
            <button onClick={simulatePay} disabled={processing}
              className="w-full bg-[#2d6be4] hover:bg-[#1a5acc] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-70">
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                  Processing...
                </span>
              ) : `Pay ₹${Number(demoPayModal.amount).toLocaleString('en-IN')}`}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-3">🔒 Secured by Razorpay · Test Mode</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {demoPayModal && <DemoPayModal />}
      {/* Step progress */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                i < step ? 'bg-terracotta-500 text-white' :
                i === step ? 'bg-terracotta-500 text-white ring-4 ring-terracotta-100' :
                'bg-cream-200 text-gray-400'
              }`}>
                {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`mt-1.5 text-xs font-medium ${i <= step ? 'text-terracotta-600' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-4 transition-colors ${i < step ? 'bg-terracotta-400' : 'bg-cream-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">

          {/* STEP 0 — Shipping Address */}
          {step === 0 && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-terracotta-500" />{t('shippingAddress')}
              </h2>
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label key={addr.id} className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-terracotta-500 bg-terracotta-50' : 'border-cream-200 hover:border-cream-300'}`}>
                    <input type="radio" name="address" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} className="hidden" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{addr.name} <span className="badge-saffron text-[10px] ml-2">{addr.label}</span></p>
                        <p className="text-sm text-gray-600 mt-1">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                        <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-sm text-gray-500">📞 {addr.phone}</p>
                      </div>
                      {selectedAddress?.id === addr.id && <CheckCircle className="w-5 h-5 text-terracotta-500 shrink-0" />}
                    </div>
                  </label>
                ))}
              </div>
              <button onClick={() => setShowNewAddress(!showNewAddress)} className="btn-outline mt-4 text-sm">
                + Add New Address
              </button>

              {showNewAddress && (
                <div className="mt-4 p-4 bg-cream-50 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Full Name *" value={newAddr.name} onChange={e => setNewAddr({...newAddr, name: e.target.value})} className="input-field !py-2.5 text-sm" />
                    <input type="tel" placeholder="Mobile (10 digits) *" maxLength={10} value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value.replace(/\D/,'')})} className="input-field !py-2.5 text-sm" />
                  </div>
                  <input placeholder="Address Line 1 *" value={newAddr.addressLine1} onChange={e => setNewAddr({...newAddr, addressLine1: e.target.value})} className="input-field !py-2.5 text-sm" />
                  <input placeholder="Address Line 2 (optional)" value={newAddr.addressLine2} onChange={e => setNewAddr({...newAddr, addressLine2: e.target.value})} className="input-field !py-2.5 text-sm" />
                  <div className="grid grid-cols-3 gap-3">
                    <input placeholder="City *" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} className="input-field !py-2.5 text-sm" />
                    <input placeholder="State *" value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} className="input-field !py-2.5 text-sm" />
                    <input type="text" placeholder="Pincode (6 digits) *" maxLength={6} value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode: e.target.value.replace(/\D/,'')})} className="input-field !py-2.5 text-sm" />
                  </div>
                  <div className="flex gap-2">
                    {['Home','Work','Other'].map(l => (
                      <button key={l} onClick={() => setNewAddr({...newAddr, label: l})} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${newAddr.label === l ? 'bg-terracotta-500 text-white' : 'bg-cream-200 text-gray-600 hover:bg-cream-300'}`}>{l}</button>
                    ))}
                  </div>
                  <button onClick={handleAddAddress} className="btn-primary text-sm">Save Address</button>
                </div>
              )}
            </div>
          )}

          {/* STEP 1 — Review Order */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold mb-4">Review Order ({items.length} items)</h2>
              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-cream-100 last:border-0">
                    <div className="w-14 h-14 bg-cream-100 rounded-xl overflow-hidden flex-shrink-0">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🏺</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
                    </div>
                    <p className="font-semibold text-sm">₹{Number(item.item_total).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
              {selectedAddress && (
                <div className="p-3 bg-cream-100 rounded-xl text-sm text-gray-600">
                  <p className="font-medium text-gray-800 mb-1">📍 Delivering to:</p>
                  <p>{selectedAddress.name} • {selectedAddress.phone}</p>
                  <p>{selectedAddress.address_line1}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — Payment */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5 text-terracotta-500" />Select Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(method => {
                  const Icon = method.icon;
                  return (
                    <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-terracotta-500 bg-terracotta-50' : 'border-cream-200 hover:border-cream-300'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="hidden" />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === method.id ? 'bg-terracotta-100' : 'bg-cream-100'}`}>
                        <Icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-terracotta-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800">{method.label}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                      {paymentMethod === method.id && <CheckCircle className="w-5 h-5 text-terracotta-500 shrink-0" />}
                    </label>
                  );
                })}

                {paymentMethod === 'upi' && (
                  <div className="mt-3 px-4">
                    <input
                      type="text"
                      placeholder="Enter UPI ID (e.g. name@upi)"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      className={`input-field text-sm ${upiId && !/^[\w.\-+]+@[\w]+$/.test(upiId) ? 'border-red-400' : ''}`}
                    />
                    {upiId && !/^[\w.\-+]+@[\w]+$/.test(upiId) && (
                      <p className="text-xs text-red-500 mt-1">Enter a valid UPI ID (e.g. 9876543210@upi)</p>
                    )}
                    {(!upiId || /^[\w.\-+]+@[\w]+$/.test(upiId)) && (
                      <p className="text-xs text-gray-400 mt-1">Supported: GPay, PhonePe, Paytm, BHIM, etc.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 p-3 bg-emerald-50 rounded-xl flex items-start gap-2 text-sm text-emerald-700">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Secured by Razorpay. Your payment information is 256-bit SSL encrypted.</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary (sticky) */}
        <div className="lg:col-span-2">
          <div className="card p-6 sticky top-24 space-y-4">
            <h3 className="font-display text-lg font-semibold">{t('orderSummary')}</h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('subtotal')} ({items.length} items)</span>
                <span>₹{Number(summary.subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('shipping')}</span>
                <span className="text-emerald-600 font-medium">{t('free')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (GST 5%)</span>
                <span>₹{Number(summary.tax || 0).toLocaleString('en-IN')}</span>
              </div>
              <hr className="border-cream-200" />
              <div className="flex justify-between font-bold text-base">
                <span>{t('total')}</span>
                <span className="text-terracotta-600">₹{Number(summary.total).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Navigation buttons */}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 0 && !canProceedFromAddress}
                className="btn-primary w-full gap-2 disabled:opacity-50"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={placeOrder}
                disabled={placing || !selectedAddress}
                className="btn-primary w-full gap-2 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                {placing ? 'Placing Order...' : paymentMethod === 'cod' ? 'Place Order (COD)' : t('payWithRazorpay')}
              </button>
            )}

            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-ghost w-full text-sm text-gray-500">
                ← Back
              </button>
            )}

            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />Razorpay 256-bit encrypted checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
