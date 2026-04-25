import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ShoppingBag, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validators, messages } from '../../utils/validators';
import toast from 'react-hot-toast';

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('buyer');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', businessName: '', craftSpeciality: '', district: '', state: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const upd = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!validators.name(form.name)) errs.name = messages.name;
    if (!validators.email(form.email)) errs.email = messages.email;
    if (!validators.password(form.password)) errs.password = messages.password;
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (role === 'seller') {
      if (!validators.phone(form.phone)) errs.phone = messages.phone;
      if (!form.businessName.trim()) errs.businessName = 'Business name is required';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, role };
      if (role === 'seller') {
        payload.phone = form.phone;
        payload.businessName = form.businessName;
        payload.craftSpeciality = form.craftSpeciality;
        payload.district = form.district;
        payload.state = form.state;
      }
      await register(payload);
      toast.success('Account created successfully!');
      navigate(role === 'seller' ? '/seller/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="font-display text-2xl font-bold text-terracotta-600 block mb-2">ODOP</Link>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-gray-500 mb-8">Join India's largest artisan marketplace</p>

        {/* Role Selector */}
        <div className="flex gap-3 mb-8">
          {[['buyer', ShoppingBag, 'Shop as Buyer', 'Discover authentic crafts'], ['seller', Store, 'Sell as Artisan', 'Reach millions of buyers']].map(([r, Icon, title, desc]) => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${role === r ? 'border-terracotta-500 bg-terracotta-50/50' : 'border-cream-200 hover:border-cream-300'}`}>
              <Icon className={`w-6 h-6 mb-2 ${role === r ? 'text-terracotta-500' : 'text-gray-400'}`} />
              <p className={`font-semibold text-sm ${role === r ? 'text-terracotta-700' : 'text-gray-700'}`}>{title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input className={`input-field ${errors.name ? 'border-red-400' : ''}`} value={form.name} onChange={upd('name')} placeholder="Rajesh Kumar" />
              <FieldError msg={errors.name} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className={`input-field ${errors.email ? 'border-red-400' : ''}`} value={form.email} onChange={upd('email')} placeholder="you@example.com" />
              <FieldError msg={errors.email} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" className={`input-field ${errors.password ? 'border-red-400' : ''}`} value={form.password} onChange={upd('password')} placeholder="Min 6 characters" />
              <FieldError msg={errors.password} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" className={`input-field ${errors.confirmPassword ? 'border-red-400' : ''}`} value={form.confirmPassword} onChange={upd('confirmPassword')} placeholder="Re-enter password" />
              <FieldError msg={errors.confirmPassword} />
            </div>
          </div>

          {role === 'seller' && (
            <>
              <div className="border-t border-cream-200 pt-4 mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Seller Details</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input className={`input-field ${errors.businessName ? 'border-red-400' : ''}`} value={form.businessName} onChange={upd('businessName')} placeholder="Rajesh Silk Weaving" />
                  <FieldError msg={errors.businessName} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" maxLength={10} className={`input-field ${errors.phone ? 'border-red-400' : ''}`} value={form.phone} onChange={upd('phone')} placeholder="9876543210" />
                  <FieldError msg={errors.phone} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Craft Speciality</label>
                <input className="input-field" value={form.craftSpeciality} onChange={upd('craftSpeciality')} placeholder="e.g. Banarasi Silk Weaving" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input className="input-field" value={form.district} onChange={upd('district')} placeholder="Varanasi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input className="input-field" value={form.state} onChange={upd('state')} placeholder="Uttar Pradesh" />
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary w-full !py-3.5 gap-2 disabled:opacity-60 mt-2">
            {loading ? 'Creating account...' : <><UserPlus className="w-5 h-5" /> Create Account</>}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-terracotta-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
