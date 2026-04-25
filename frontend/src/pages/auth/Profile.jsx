import { useState, useEffect } from 'react';
import { User, MapPin, Lock, Trash2, Plus, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, sellerProfile, updateUser, loadUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [sellerForm, setSellerForm] = useState({ businessName: '', craftSpeciality: '', bio: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [addresses, setAddresses] = useState([]);
  const [showAddr, setShowAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({ name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', label: 'Home' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    if (sellerProfile) setSellerForm({ businessName: sellerProfile.business_name || '', craftSpeciality: sellerProfile.craft_speciality || '', bio: sellerProfile.bio || '' });
  }, [user, sellerProfile]);

  useEffect(() => {
    if (user?.role === 'buyer') {
      authAPI.getProfile().then(r => setAddresses(r.data.addresses || [])).catch(() => {});
    }
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.user || form);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const saveSellerProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateSellerProfile(sellerForm);
      toast.success('Seller profile updated');
      loadUser();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const addAddr = async (e) => {
    e.preventDefault();
    try {
      await authAPI.addAddress(addrForm);
      const r = await authAPI.getProfile();
      setAddresses(r.data.addresses || []);
      setShowAddr(false);
      setAddrForm({ name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', label: 'Home' });
      toast.success('Address added');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const delAddr = async (id) => {
    try {
      await authAPI.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address removed');
    } catch (err) { toast.error('Failed to remove address'); }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    ...(user?.role === 'buyer' ? [{ id: 'addresses', label: 'Addresses', icon: MapPin }] : []),
    ...(user?.role === 'seller' ? [{ id: 'seller', label: 'Seller Info', icon: User }] : []),
    { id: 'password', label: 'Password', icon: Lock },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="section-heading mb-8">My Account</h1>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-terracotta-500 text-white' : 'bg-white border border-cream-200 text-gray-600 hover:bg-cream-50'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input-field bg-gray-50" value={form.email} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <span className="badge-terracotta capitalize">{user?.role}</span>
            <span className="text-xs text-gray-400">Joined {new Date(user?.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</span>
          </div>
          <button type="submit" disabled={saving} className="btn-primary gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      )}

      {tab === 'addresses' && (
        <div className="space-y-4">
          {addresses.map(a => (
            <div key={a.id} className="card p-5 flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm">{a.name} <span className="badge bg-cream-200 text-gray-600 ml-2">{a.label}</span></p>
                <p className="text-sm text-gray-600 mt-1">{a.address_line_1}{a.address_line_2 ? `, ${a.address_line_2}` : ''}</p>
                <p className="text-sm text-gray-500">{a.city}, {a.state} — {a.pincode}</p>
                <p className="text-xs text-gray-400 mt-1">{a.phone}</p>
              </div>
              <button onClick={() => delAddr(a.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}

          {!showAddr ? (
            <button onClick={() => setShowAddr(true)} className="btn-outline gap-2 text-sm"><Plus className="w-4 h-4" /> Add Address</button>
          ) : (
            <form onSubmit={addAddr} className="card p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Name</label><input className="input-field" required value={addrForm.name} onChange={e => setAddrForm({ ...addrForm, name: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Phone</label><input className="input-field" required value={addrForm.phone} onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })} /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Address Line 1</label><input className="input-field" required value={addrForm.addressLine1} onChange={e => setAddrForm({ ...addrForm, addressLine1: e.target.value })} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2</label><input className="input-field" value={addrForm.addressLine2} onChange={e => setAddrForm({ ...addrForm, addressLine2: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">City</label><input className="input-field" required value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">State</label><input className="input-field" required value={addrForm.state} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Pincode</label><input className="input-field" required value={addrForm.pincode} onChange={e => setAddrForm({ ...addrForm, pincode: e.target.value })} /></div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary text-sm">Save Address</button>
                <button type="button" onClick={() => setShowAddr(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === 'seller' && sellerProfile && (
        <form onSubmit={saveSellerProfile} className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input className="input-field" value={sellerForm.businessName} onChange={e => setSellerForm({ ...sellerForm, businessName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Craft Speciality</label>
            <input className="input-field" value={sellerForm.craftSpeciality} onChange={e => setSellerForm({ ...sellerForm, craftSpeciality: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea className="input-field min-h-[100px]" value={sellerForm.bio} onChange={e => setSellerForm({ ...sellerForm, bio: e.target.value })} placeholder="Tell buyers about your craft story..." />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>District: <strong>{sellerProfile.district}</strong></span>
            <span>State: <strong>{sellerProfile.state}</strong></span>
            <span className={`badge ${sellerProfile.verification === 'verified' ? 'badge-green' : 'badge-saffron'}`}>{sellerProfile.verification}</span>
          </div>
          <button type="submit" disabled={saving} className="btn-primary gap-2"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={changePw} className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" className="input-field" required value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" className="input-field" required value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" className="input-field" required value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary gap-2"><Lock className="w-4 h-4" /> {saving ? 'Changing...' : 'Change Password'}</button>
        </form>
      )}
    </div>
  );
}
