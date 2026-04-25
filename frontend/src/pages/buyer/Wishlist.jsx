import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { dashboardAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await dashboardAPI.getWishlist();
      setItems(data.wishlist || []);
    } catch { toast.error('Failed to load wishlist'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (productId) => {
    try {
      await dashboardAPI.toggleWishlist({ productId });
      setItems(prev => prev.filter(i => i.product_id !== productId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
  };

  const moveToCart = async (item) => {
    try {
      await addToCart(item.product_id, 1);
      await dashboardAPI.toggleWishlist({ productId: item.product_id });
      setItems(prev => prev.filter(i => i.product_id !== item.product_id));
      toast.success('Moved to cart!');
    } catch (err) { toast.error(typeof err === 'string' ? err : 'Failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        <h1 className="font-display text-2xl font-bold text-gray-900">My Wishlist</h1>
        {items.length > 0 && <span className="badge bg-cream-200 text-gray-600">{items.length} items</span>}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-400 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-6">Save items you love for later</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map(item => (
            <div key={item.id} className="relative group">
              <ProductCard product={{ ...item, id: item.product_id, category: item.category || 'Handicrafts' }} />
              <div className="absolute bottom-[4.5rem] left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => moveToCart(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-medium py-2 rounded-lg transition-colors shadow-lg"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                </button>
                <button
                  onClick={() => remove(item.product_id)}
                  className="w-9 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors shadow-lg"
                >
                  <Heart className="w-4 h-4 fill-red-400 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
