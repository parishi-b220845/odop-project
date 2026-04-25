import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, MapPin, ShieldCheck, Award, Truck, Clock, Users, Minus, Plus, ChevronRight } from 'lucide-react';
import { productAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await productAPI.getBySlug(slug);
        setProduct(data.product);
        setReviews(data.reviews);
        setRelated(data.relatedProducts);
        // Save to recently viewed
        try {
          const p = data.product;
          const recent = JSON.parse(localStorage.getItem('odop_recent') || '[]');
          const updated = [{ id: p.id, slug: p.slug, name: p.name, price: p.price, thumbnail: p.thumbnail, category: p.category, state: p.state, district: p.district, avg_rating: p.avg_rating, review_count: p.review_count }, ...recent.filter(r => r.slug !== p.slug)].slice(0, 8);
          localStorage.setItem('odop_recent', JSON.stringify(updated));
        } catch {}
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add to cart'); return; }
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      toast.success('Added to cart!');
    } catch (err) { toast.error(typeof err === 'string' ? err : 'Failed to add'); }
    setAdding(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-20"><h2 className="text-xl text-gray-600">Product not found</h2></div>;

  const discount = product.compare_price ? Math.round((1 - product.price / product.compare_price) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-terracotta-500">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-terracotta-500">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?category=${product.category}`} className="hover:text-terracotta-500">{product.category}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Image */}
        {(() => {
          const FALLBACKS = {
            'Textiles':      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=800&fit=crop',
            'Pottery':       'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=800&fit=crop',
            'Handicrafts':   'https://images.unsplash.com/photo-1582719478234-5f52df61ed6e?w=800&h=800&fit=crop',
            'Metal Crafts':  'https://images.unsplash.com/photo-1611784041520-b0e1ae46d7af?w=800&h=800&fit=crop',
            'Art':           'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop',
            'Food Products': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=800&fit=crop',
            'Jewelry':       'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
          };
          const fallback = FALLBACKS[product.category] || 'https://images.unsplash.com/photo-1542621334-8799d4d5657a?w=800&h=800&fit=crop';
          let raw = product.thumbnail || (product.images?.[0]) || fallback;
          const m = raw.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
          const src = m ? `/api/images/${m[1]}` : raw;
          return (
            <div className="bg-cream-200 rounded-2xl overflow-hidden aspect-square">
              <img
                src={src}
                alt={product.name}
                loading="eager"
                className="w-full h-full object-cover"
                onError={(e) => { if (e.target.src !== fallback) e.target.src = fallback; }}
              />
            </div>
          );
        })()}

        {/* Details */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {product.odop_verified && <span className="badge-saffron flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" />ODOP Verified</span>}
            {product.gi_tagged && <span className="badge-terracotta flex items-center gap-1"><Award className="w-3.5 h-3.5" />GI Tagged</span>}
            {product.is_handmade && <span className="badge-indigo">Handmade</span>}
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-saffron-500 fill-saffron-500" />
              <span className="font-medium text-sm">{parseFloat(product.avg_rating).toFixed(1)}</span>
              <span className="text-gray-400 text-sm">({product.review_count} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />{product.district}, {product.state}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-5">
            <span className="font-display text-3xl font-bold text-gray-900">₹{Number(product.price).toLocaleString('en-IN')}</span>
            {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{Number(product.compare_price).toLocaleString('en-IN')}</span>
                <span className="badge bg-emerald-100 text-emerald-700">Save {discount}%</span>
              </>
            )}
          </div>

          <p className="text-gray-600 mt-4 leading-relaxed">{product.short_description || product.description?.substring(0, 200)}</p>

          {/* Info pills */}
          <div className="flex flex-wrap gap-3 mt-5">
            {product.making_time && <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-cream-100 px-3 py-1.5 rounded-full"><Clock className="w-3.5 h-3.5" />Making: {product.making_time}</div>}
            {product.materials && <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-cream-100 px-3 py-1.5 rounded-full">Materials: {product.materials}</div>}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-cream-100 px-3 py-1.5 rounded-full"><Truck className="w-3.5 h-3.5" />Free shipping above ₹999</div>
          </div>

          {/* Quantity & Cart */}
          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-cream-200 rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-cream-50"><Minus className="w-4 h-4" /></button>
              <span className="px-4 font-medium text-sm">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 hover:bg-cream-50"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleAddToCart} disabled={adding || product.stock === 0} className="btn-primary flex-1 gap-2 disabled:opacity-50">
              <ShoppingCart className="w-4 h-4" />{product.stock === 0 ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>

          {product.stock > 0 && product.stock <= 10 && <p className="text-sm text-amber-600 mt-2">Only {product.stock} left in stock!</p>}

          {/* Bulk pricing */}
          {product.bulk_available && (
            <div className="mt-5 p-4 bg-saffron-50 rounded-xl border border-saffron-200">
              <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-saffron-600" /><span className="font-medium text-sm text-saffron-800">Bulk Order Available</span></div>
              <p className="text-sm text-saffron-700">Order {product.min_bulk_qty}+ units at ₹{Number(product.bulk_price).toLocaleString('en-IN')} each</p>
            </div>
          )}

          {/* Seller Info */}
          <div className="mt-6 p-4 bg-cream-50 rounded-xl border border-cream-200">
            <p className="text-xs text-gray-500 mb-1">Sold by</p>
            <p className="font-medium text-gray-900">{product.business_name || product.seller_name}</p>
            {product.seller_rating && <div className="flex items-center gap-1 mt-1"><Star className="w-3 h-3 text-saffron-500 fill-saffron-500" /><span className="text-xs text-gray-600">{parseFloat(product.seller_rating).toFixed(1)} seller rating</span></div>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex border-b border-cream-200">
          {['description', 'story', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-body font-medium text-sm capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-terracotta-500 text-terracotta-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab === 'reviews' ? `Reviews (${product.review_count})` : tab}
            </button>
          ))}
        </div>
        <div className="py-8">
          {activeTab === 'description' && <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</div>}
          {activeTab === 'story' && (
            product.artisan_story
              ? <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">{product.artisan_story}</div>
              : <div className="text-center py-12"><p className="text-gray-400 italic">The artisan's story for this product is coming soon.</p></div>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="font-medium text-gray-500 mb-1">No reviews yet</p>
                  <p className="text-sm text-gray-400">Be the first to share your experience</p>
                </div>
              ) : reviews.map(r => (
                <div key={r.id} className="p-4 bg-white border border-cream-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'text-saffron-500 fill-saffron-500' : 'text-gray-200'}`} />)}</div>
                    <span className="font-medium text-sm">{r.user_name}</span>
                    {r.is_verified_purchase && <span className="badge-green text-[10px]">Verified Purchase</span>}
                  </div>
                  {r.title && <p className="font-medium text-gray-900 text-sm">{r.title}</p>}
                  <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-8">
          <h2 className="section-heading text-2xl mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} compact />)}
          </div>
        </div>
      )}
    </div>
  );
}
