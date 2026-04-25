import { useState, useEffect } from 'react';
import { HelpCircle, Plus, Send, ChevronDown, ChevronUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supportAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_STYLE = {
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-100 text-gray-500',
};

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '', category: 'general' });
  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const fetchTickets = () => {
    supportAPI.getAll().then(r => setTickets(r.data.tickets || r.data || []))
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await supportAPI.create(newTicket);
      toast.success('Ticket created');
      setShowNew(false);
      setNewTicket({ subject: '', message: '', category: 'general' });
      fetchTickets();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const loadDetail = async (id) => {
    if (expandedId === id) { setExpandedId(null); setDetail(null); return; }
    try {
      const { data } = await supportAPI.getById(id);
      setDetail(data);
      setExpandedId(id);
    } catch { toast.error('Failed to load ticket'); }
  };

  const handleReply = async (id) => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await supportAPI.reply(id, { message: reply });
      setReply('');
      loadDetail(id);
      toast.success('Reply sent');
    } catch (err) { toast.error('Failed to send reply'); }
    finally { setSending(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-heading">Support</h1>
          <p className="text-gray-500 text-sm mt-1">Need help? We're here for you.</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="btn-primary text-sm gap-2">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {/* New ticket form */}
      {showNew && (
        <form onSubmit={handleCreate} className="card p-6 mb-8 animate-slide-up space-y-4">
          <h3 className="font-display text-lg font-semibold">Create Support Ticket</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input className="input-field" required value={newTicket.subject} onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })} placeholder="Brief description" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="input-field" value={newTicket.category} onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}>
                <option value="general">General</option>
                <option value="order">Order Issue</option>
                <option value="payment">Payment</option>
                <option value="product">Product</option>
                <option value="account">Account</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea className="input-field min-h-[100px]" required value={newTicket.message} onChange={e => setNewTicket({ ...newTicket, message: e.target.value })} placeholder="Describe your issue in detail..." />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm">Submit Ticket</button>
            <button type="button" onClick={() => setShowNew(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Tickets */}
      {tickets.length === 0 ? (
        <div className="text-center py-16">
          <HelpCircle className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">No support tickets yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <div key={t.id} className="card overflow-hidden">
              <button onClick={() => loadDetail(t.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-cream-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {t.status === 'resolved' ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> :
                   t.status === 'open' ? <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" /> :
                   <Clock className="w-4 h-4 text-blue-500 shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{t.subject}</p>
                    <p className="text-xs text-gray-400">{t.ticket_number} · {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${STATUS_STYLE[t.status] || STATUS_STYLE.open}`}>{(t.status || 'open').replace('_', ' ')}</span>
                  {expandedId === t.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {expandedId === t.id && detail && (
                <div className="border-t border-cream-100 p-5 bg-cream-50/30 animate-fade-in">
                  {/* Messages */}
                  <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                    {(detail.messages || []).map((msg, i) => (
                      <div key={i} className={`flex flex-col gap-1 ${msg.sender_id === user.id ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] font-medium text-gray-400 px-1">
                          {msg.sender_id === user.id ? 'You' : 'Support Team'}
                        </span>
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender_id === user.id ? 'bg-terracotta-500 text-white rounded-tr-sm' : 'bg-white border border-cream-200 text-gray-700 rounded-tl-sm'}`}>
                          <p className="break-words">{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${msg.sender_id === user.id ? 'text-terracotta-200' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply */}
                  {t.status !== 'closed' && (
                    <div className="flex gap-2">
                      <input className="input-field flex-1 !py-2.5 text-sm" placeholder="Type a reply..."
                        value={reply} onChange={e => setReply(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleReply(t.id); }} />
                      <button onClick={() => handleReply(t.id)} disabled={sending || !reply.trim()}
                        className="btn-primary !px-4 disabled:opacity-50"><Send className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
