import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DEMO = [
  { label: 'Buyer', email: 'priya@example.com', password: 'password123' },
  { label: 'Seller', email: 'ramesh@example.com', password: 'password123' },
  { label: 'Admin', email: 'admin@odopmarket.in', password: 'password123' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'seller' ? '/seller/dashboard' : data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const demoLogin = (d) => { setForm({ email: d.email, password: d.password }); };

  return (
    <div className="min-h-[85vh] flex">
      {/* Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-terracotta-500 via-terracotta-600 to-terracotta-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-texture-subtle opacity-20" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h2 className="font-display text-5xl font-bold leading-tight mb-6">Discover India's<br />Finest Crafts</h2>
          <p className="text-terracotta-100 text-lg leading-relaxed mb-10 max-w-md">
            Connect directly with artisans from 700+ districts. Every purchase supports India's rich heritage.
          </p>
          <div className="flex gap-8">
            {[['700+', 'Districts'], ['10K+', 'Artisans'], ['50K+', 'Products']].map(([n, l]) => (
              <div key={l}><p className="text-3xl font-display font-bold">{n}</p><p className="text-terracotta-200 text-sm">{l}</p></div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-terracotta-400/20" />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-saffron-400/10" />
      </div>

      {/* Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="font-display text-2xl font-bold text-terracotta-600 block mb-2">ODOP</Link>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} required className="input-field pr-12" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full !py-3.5 gap-2 disabled:opacity-60">
              {loading ? 'Signing in...' : <><LogIn className="w-5 h-5" /> Sign In</>}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-xs text-gray-400 text-center mb-3">Quick demo access</p>
            <div className="flex gap-2">
              {DEMO.map(d => (
                <button key={d.label} onClick={() => demoLogin(d)}
                  className="flex-1 py-2 px-3 text-xs font-medium border border-cream-300 rounded-lg hover:bg-cream-100 transition-colors text-gray-600">
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-terracotta-600 font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
