import { Link } from 'react-router-dom';
import { Star, Heart, ShieldCheck, MapPin, Award } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Reliable Unsplash fallbacks per category — used when Drive image fails to load
const CATEGORY_FALLBACKS = {
  'Textiles':      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=600&fit=crop',
  'Pottery':       'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop',
  'Handicrafts':   'https://images.unsplash.com/photo-1582719478234-5f52df61ed6e?w=600&h=600&fit=crop',
  'Metal Crafts':  'https://images.unsplash.com/photo-1611784041520-b0e1ae46d7af?w=600&h=600&fit=crop',
  'Art':           'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop',
  'Food Products': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=600&fit=crop',
  'Jewelry':       'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop',
  'default':       'https://images.unsplash.com/photo-1542621334-8799d4d5657a?w=600&h=600&fit=crop',
};

const getFallback = (product) =>
  CATEGORY_FALLBACKS[product?.category] || CATEGORY_FALLBACKS.default;

const lh3ToProxy = (url) => {
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? `/api/images/${m[1]}` : url;
};

const isValidUrl = (u) => u && (u.startsWith('http') || u.startsWith('/'));

const getProductImage = (product) => {
  const thumb = product.thumbnail;
  if (isValidUrl(thumb)) return thumb.includes('lh3.googleusercontent.com') ? lh3ToProxy(thumb) : thumb;
  const first = product.images?.[0];
  if (isValidUrl(first)) return first.includes('lh3.googleusercontent.com') ? lh3ToProxy(first) : first;
  return getFallback(product);
};

export default function ProductCard({ product, compact = false }) {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to add to wishlist'); return; }
    try {
      const { data } = await dashboardAPI.toggleWishlist({ productId: product.id });
      setWishlisted(data.added);
      toast.success(data.message);
    } catch { toast.error('Failed'); }
  };

  const discount = product.compare_price ? Math.round((1 - product.price / product.compare_price) * 100) : 0;

  return (
    <Link to={`/products/${product.slug}`} className={`card-hover group block ${compact ? '' : ''}`}>
      {/* Image */}
      <div className="relative aspect-square bg-cream-200 overflow-hidden">
        <img
          src={imgError ? getFallback(product) : getProductImage(product)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setImgError(true)}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.odop_verified && (
            <span className="badge-saffron !text-[10px] flex items-center gap-1 shadow-sm"><ShieldCheck className="w-3 h-3" />ODOP</span>
          )}
          {product.gi_tagged && (
            <span className="badge-terracotta !text-[10px] flex items-center gap-1 shadow-sm"><Award className="w-3 h-3" />GI Tag</span>
          )}
          {discount > 0 && (
            <span className="badge bg-emerald-500 text-white !text-[10px] shadow-sm">-{discount}%</span>
          )}
        </div>

        {/* Wishlist */}
        <button onClick={toggleWishlist} className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
          <MapPin className="w-3 h-3" />
          <span>{product.district}, {product.state}</span>
        </div>

        <h3 className="font-body font-semibold text-gray-900 line-clamp-2 text-sm leading-snug group-hover:text-terracotta-600 transition-colors">{product.name}</h3>

        {!compact && product.seller_name && (
          <p className="text-xs text-gray-400 mt-1">by {product.business_name || product.seller_name}</p>
        )}

        {/* Rating */}
        {product.avg_rating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-3.5 h-3.5 text-saffron-500 fill-saffron-500" />
            <span className="text-xs font-medium text-gray-700">{parseFloat(product.avg_rating).toFixed(1)}</span>
            <span className="text-xs text-gray-400">({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2.5">
          <span className="font-body font-bold text-lg text-gray-900">₹{Number(product.price).toLocaleString('en-IN')}</span>
          {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
            <span className="text-xs text-gray-400 line-through">₹{Number(product.compare_price).toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
