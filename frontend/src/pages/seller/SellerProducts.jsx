import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Edit3, Trash2, Eye, EyeOff, Package, Star,
  ChevronLeft, ChevronRight, X, Upload, AlertCircle, CheckCircle, Image as ImageIcon,
  ShieldCheck, Sparkles, Loader
} from 'lucide-react';
import { productAPI, validateAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Textiles & Handloom', 'Handicrafts', 'Food & Spices', 'Pottery & Ceramics',
  'Jewelry & Accessories', 'Art & Paintings', 'Leather Goods', 'Metal Crafts',
  'Woodwork & Carvings', 'Natural & Organic', 'Musical Instruments', 'Other'
];

function ProductFormModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    compare_price: product?.compare_price || '',
    category: product?.category || CATEGORIES[0],
    stock: product?.stock || '',
    min_order_qty: product?.min_order_qty || 1,
    state: product?.state || '',
    district: product?.district || '',
    gi_tag: product?.gi_tag || false,
    odop_product: product?.odop_product || '',
    cultural_significance: product?.cultural_significance || '',
    materials: product?.materials || '',
    care_instructions: product?.care_instructions || '',
  });
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
  };

  const handleValidate = async () => {
    if (!form.name || !form.description || !form.category) {
      toast.error('Please fill name, description, and category before validating');
      return;
    }
    setValidating(true);
    setValidation(null);
    try {
      const { data } = await validateAPI.product({
        name: form.name,
        description: form.description,
        category: form.category,
        state: form.state,
        district: form.district,
        odopProductName: form.odop_product,
        price: Number(form.price),
      });
      setValidation(data);
    } catch (err) {
      toast.error('Validation service unavailable');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock || !form.category) {
      return toast.error('Fill in all required fields');
    }
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) formData.append(k, v);
      });
      images.forEach(img => formData.append('images', img));

      if (isEdit) {
        await productAPI.update(product.id, formData);
        toast.success('Product updated');
      } else {
        await productAPI.create(formData);
        toast.success('Product created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 pt-16">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-fade-in">
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-cream-200 p-5 flex items-center justify-between z-10">
          <h2 className="font-display text-xl font-semibold">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-cream-100 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[60vh] overflow-y-auto overscroll-contain">
          {/* Name & Category */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="e.g. Banarasi Silk Saree" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input name="price" type="number" min="1" value={form.price} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price</label>
              <input name="compare_price" type="number" min="0" value={form.compare_price} onChange={handleChange} className="input-field" placeholder="MRP" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Qty</label>
              <input name="min_order_qty" type="number" min="1" value={form.min_order_qty} onChange={handleChange} className="input-field" />
            </div>
          </div>

          {/* Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input name="state" value={form.state} onChange={handleChange} className="input-field" placeholder="e.g. Uttar Pradesh" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input name="district" value={form.district} onChange={handleChange} className="input-field" placeholder="e.g. Varanasi" />
            </div>
          </div>

          {/* ODOP & GI */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ODOP Product Name</label>
              <input name="odop_product" value={form.odop_product} onChange={handleChange} className="input-field" placeholder="Official ODOP name" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer py-3">
                <input type="checkbox" name="gi_tag" checked={form.gi_tag} onChange={handleChange} className="w-4 h-4 text-terracotta-600 rounded focus:ring-terracotta-300" />
                <span className="text-sm font-medium text-gray-700">GI Tag Certified</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="input-field resize-none" placeholder="Describe the product, its craft, origin..." />
          </div>

          {/* Cultural Significance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cultural Significance</label>
            <textarea name="cultural_significance" value={form.cultural_significance} onChange={handleChange} rows={2} className="input-field resize-none" placeholder="Heritage and cultural context..." />
          </div>

          {/* Materials & Care */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Materials</label>
              <input name="materials" value={form.materials} onChange={handleChange} className="input-field" placeholder="e.g. Pure silk, zari" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Care Instructions</label>
              <input name="care_instructions" value={form.care_instructions} onChange={handleChange} className="input-field" placeholder="e.g. Dry clean only" />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images {!isEdit && '(up to 5)'}</label>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-cream-300 rounded-xl cursor-pointer hover:bg-cream-50 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-sm text-gray-500">
                {images.length > 0 ? `${images.length} file(s) selected` : 'Click to upload images'}
              </span>
              <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
            </label>
            {isEdit && product?.images?.length > 0 && (
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> {product.images.length} existing image(s). Uploading new ones will add to them.
              </p>
            )}
          </div>
        </form>

        {/* AI Validation panel */}
        {validation && (
          <div className={`mx-5 mb-4 p-4 rounded-xl border ${validation.approved ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${validation.approved ? 'text-emerald-600' : 'text-amber-600'}`} />
                <span className="font-semibold text-sm">AI Validation Score: {validation.score}/100</span>
              </div>
              <span className={`badge text-xs ${validation.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {validation.approved ? '✅ Approved' : '⚠️ Needs Improvement'}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-3">{validation.summary}</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {Object.entries(validation.checks || {}).map(([key, check]) => (
                <div key={key} className={`flex items-start gap-1.5 p-2 rounded-lg text-xs ${check.pass ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  {check.pass ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />}
                  <span className={check.pass ? 'text-emerald-700' : 'text-red-600'}>{check.note}</span>
                </div>
              ))}
            </div>
            {validation.suggestions?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">💡 Suggestions:</p>
                <ul className="space-y-1">
                  {validation.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1"><span className="text-terracotta-500 mt-0.5">•</span>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-2">Source: {validation.source === 'ai' ? 'Claude AI' : 'Rule-based'}</p>
          </div>
        )}

        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-cream-200 p-5 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="button" onClick={handleValidate} disabled={validating} className="btn-outline gap-1.5 text-sm">
            {validating ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {validating ? 'Validating...' : 'AI Validate'}
          </button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalProduct, setModalProduct] = useState(undefined); // undefined=closed, null=new, object=edit
  const limit = 10;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productAPI.getSellerProducts({ page, limit, search: search || undefined });
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="section-heading text-2xl">My Products</h1>
          <p className="text-sm text-gray-500 mt-1">{total} product{total !== 1 ? 's' : ''} listed</p>
        </div>
        <button onClick={() => setModalProduct(null)} className="btn-primary gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="input-field pl-10"
          placeholder="Search your products..."
        />
      </div>

      {/* Products Table */}
      {loading ? <LoadingSpinner /> : products.length === 0 ? (
        <div className="card p-16 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No products found</p>
          <button onClick={() => setModalProduct(null)} className="btn-primary text-sm gap-2">
            <Plus className="w-4 h-4" /> Add Your First Product
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50/50">
                  <th className="text-left py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-center py-3.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-right py-3.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-center py-3.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="text-center py-3.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Rating</th>
                  <th className="text-center py-3.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3.5 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-cream-100 hover:bg-cream-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-cream-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link to={`/products/${p.slug}`} className="font-medium text-gray-800 hover:text-terracotta-600 truncate block">
                            {p.name}
                          </Link>
                          <p className="text-xs text-gray-400 truncate">{p.district}, {p.state}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-gray-500 hidden md:table-cell">
                      <span className="badge bg-cream-100 text-gray-600">{p.category}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold">₹{Number(p.price).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`badge ${p.stock > 10 ? 'badge-green' : p.stock > 0 ? 'badge-saffron' : 'bg-red-100 text-red-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-saffron-600 text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" /> {Number(p.avg_rating || 0).toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {p.is_active !== false ? (
                        <span className="badge badge-green gap-1"><Eye className="w-3 h-3" /> Live</span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-500 gap-1"><EyeOff className="w-3 h-3" /> Hidden</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setModalProduct(p)} className="p-2 rounded-lg text-gray-500 hover:bg-cream-100 hover:text-terracotta-600 transition-colors" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-cream-200 bg-cream-50/30">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-cream-200 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = totalPages <= 5 ? i + 1 : Math.min(Math.max(page - 2, 1), totalPages - 4) + i;
                  return (
                    <button key={pageNum} onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pageNum === page ? 'bg-terracotta-500 text-white' : 'hover:bg-cream-200 text-gray-600'}`}>
                      {pageNum}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-cream-200 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalProduct !== undefined && (
        <ProductFormModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSaved={() => { setModalProduct(undefined); fetchProducts(); }}
        />
      )}
    </div>
  );
}
