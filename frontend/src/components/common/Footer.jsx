import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-indigo-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-terracotta-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🏺</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">ODOP</h3>
                <p className="text-[10px] text-indigo-300 tracking-widest uppercase">Marketplace</p>
              </div>
            </div>
            <p className="text-indigo-200 text-sm leading-relaxed">Empowering Indian artisans through the One District One Product initiative. Every purchase supports a local craft tradition.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-base font-semibold mb-4">Discover</h4>
            <div className="space-y-2">
              <Link to="/products" className="block text-sm text-indigo-200 hover:text-saffron-400 transition-colors">All Products</Link>
              <Link to="/explore" className="block text-sm text-indigo-200 hover:text-saffron-400 transition-colors">Explore India Map</Link>
              <Link to="/cultural-hub" className="block text-sm text-indigo-200 hover:text-saffron-400 transition-colors">Cultural Stories</Link>
              <Link to="/products?odopVerified=true" className="block text-sm text-indigo-200 hover:text-saffron-400 transition-colors">ODOP Verified</Link>
              <Link to="/products?giTagged=true" className="block text-sm text-indigo-200 hover:text-saffron-400 transition-colors">GI Tagged Products</Link>
            </div>
          </div>

          {/* Seller */}
          <div>
            <h4 className="font-display text-base font-semibold mb-4">For Artisans</h4>
            <div className="space-y-2">
              <Link to="/register" className="block text-sm text-indigo-200 hover:text-saffron-400 transition-colors">Become a Seller</Link>
              <Link to="/seller/dashboard" className="block text-sm text-indigo-200 hover:text-saffron-400 transition-colors">Seller Dashboard</Link>
              <Link to="/support" className="block text-sm text-indigo-200 hover:text-saffron-400 transition-colors">Help & Support</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-base font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm text-indigo-200">
              <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-saffron-400" /><span>SKIT, Jaipur, Rajasthan 302017</span></div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-saffron-400" /><span>support@odopmarket.in</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-saffron-400" /><span>+91 1234 567 890</span></div>
            </div>
          </div>
        </div>

        <div className="border-t border-indigo-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-indigo-300">© 2026 ODOP Marketplace. A B.Tech Final Year Project.</p>
          <p className="text-xs text-indigo-300 flex items-center gap-1">Made with <Heart className="w-3 h-3 text-terracotta-400 fill-terracotta-400" /> by Nishtha, Parishi & Prajwal</p>
        </div>
      </div>
    </footer>
  );
}
