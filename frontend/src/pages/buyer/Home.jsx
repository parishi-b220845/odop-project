import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ShieldCheck, Award, Truck, Heart, Star, ChevronRight } from 'lucide-react';
import { productAPI, mapAPI } from '../../services/api';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const HERO_CRAFTS = [
  { name: 'Banarasi Silk', state: 'Uttar Pradesh', emoji: '🧣' },
  { name: 'Madhubani Art', state: 'Bihar', emoji: '🎨' },
  { name: 'Blue Pottery', state: 'Rajasthan', emoji: '🏺' },
  { name: 'Pashmina', state: 'Kashmir', emoji: '🧶' },
  { name: 'Pattachitra', state: 'Odisha', emoji: '🖼️' },
];

const CATEGORIES = [
  { name: 'Textiles', icon: '🧣', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { name: 'Art', icon: '🎨', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { name: 'Pottery', icon: '🏺', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Handicrafts', icon: '✋', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Jewelry', icon: '💎', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { name: 'Food Products', icon: '🍯', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Leather', icon: '👜', color: 'bg-stone-50 text-stone-700 border-stone-200' },
  { name: 'Toys', icon: '🎭', color: 'bg-pink-50 text-pink-700 border-pink-200' },
];

const FEATURES = [
  { icon: ShieldCheck, title: 'ODOP Verified', desc: 'Every product validated against official GOI dataset', color: 'text-saffron-600 bg-saffron-50' },
  { icon: Award, title: 'GI Tagged', desc: 'Authentic products with Geographical Indication tags', color: 'text-terracotta-600 bg-terracotta-50' },
  { icon: Heart, title: 'Artisan Direct', desc: 'Buy directly from craftspeople, no middlemen', color: 'text-indigo-600 bg-indigo-50' },
  { icon: Truck, title: 'Pan-India Delivery', desc: 'Free shipping on orders above ₹999', color: 'text-emerald-600 bg-emerald-50' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHero, setActiveHero] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await productAPI.getFeatured();
        setFeatured(data.products);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
    try { setRecentlyViewed(JSON.parse(localStorage.getItem('odop_recent') || '[]')); } catch {}
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveHero(prev => (prev + 1) % HERO_CRAFTS.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* ─── Hero Section ────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero-pattern bg-texture-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-cream-200 mb-6">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-body font-medium text-gray-600">Government of India Initiative</span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                One District,<br />
                <span className="text-terracotta-500">One Product</span>
              </h1>

              <p className="font-body text-lg text-gray-600 mt-5 leading-relaxed max-w-lg">
                Discover India's finest handicrafts sourced directly from artisans across 103+ districts. Every purchase preserves a centuries-old tradition.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/products" className="btn-primary gap-2 text-base">
                  Explore Products <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/explore" className="btn-outline gap-2 text-base">
                  <MapPin className="w-4 h-4" /> View Craft Map
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-10 pt-8 border-t border-cream-300">
                <div><span className="font-display text-2xl font-bold text-terracotta-600">106+</span><p className="text-xs text-gray-500 mt-0.5">ODOP Products</p></div>
                <div><span className="font-display text-2xl font-bold text-saffron-600">27</span><p className="text-xs text-gray-500 mt-0.5">States</p></div>
                <div><span className="font-display text-2xl font-bold text-indigo-600">103+</span><p className="text-xs text-gray-500 mt-0.5">Districts</p></div>
              </div>
            </div>

            {/* Hero Craft Showcase */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Decorative rings */}
                <div className="absolute inset-0 border-2 border-terracotta-200 rounded-full animate-pulse opacity-30" />
                <div className="absolute inset-4 border-2 border-saffron-200 rounded-full" />
                <div className="absolute inset-8 border border-dashed border-terracotta-300 rounded-full" />

                {/* Center craft */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center animate-fade-in" key={activeHero}>
                    <span className="text-7xl block mb-4">{HERO_CRAFTS[activeHero].emoji}</span>
                    <h3 className="font-display text-xl font-semibold text-gray-900">{HERO_CRAFTS[activeHero].name}</h3>
                    <p className="text-sm text-terracotta-500 mt-1">{HERO_CRAFTS[activeHero].state}</p>
                  </div>
                </div>

                {/* Orbiting dots */}
                {HERO_CRAFTS.map((_, i) => (
                  <div key={i} className={`absolute w-3 h-3 rounded-full transition-all duration-500 ${i === activeHero ? 'bg-terracotta-500 scale-150' : 'bg-cream-400'}`}
                    style={{ top: `${50 + 42 * Math.sin(2 * Math.PI * i / HERO_CRAFTS.length)}%`, left: `${50 + 42 * Math.cos(2 * Math.PI * i / HERO_CRAFTS.length)}%`, transform: 'translate(-50%,-50%)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Strip ──────────────────────────── */}
      <section className="bg-white border-y border-cream-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-body font-semibold text-sm text-gray-900">{f.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="section-heading">Explore by Category</h2>
          <p className="section-subheading">From handwoven textiles to exquisite pottery</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            <Link key={i} to={`/products?category=${cat.name}`}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 ${cat.color} hover:shadow-md transition-all hover:-translate-y-1`}>
              <span className="text-3xl">{cat.icon}</span>
              <span className="font-body font-semibold text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Featured Products ───────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-heading">Featured Crafts</h2>
              <p className="section-subheading">Handpicked masterpieces from India's finest artisans</p>
            </div>
            <Link to="/products?featured=true" className="hidden sm:flex items-center gap-1 text-terracotta-600 font-medium text-sm hover:text-terracotta-700">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/products" className="btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* ─── Recently Viewed ─────────────────────────── */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-heading text-2xl">Recently Viewed</h2>
            <button onClick={() => { localStorage.removeItem('odop_recent'); setRecentlyViewed([]); }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Clear</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {recentlyViewed.slice(0, 6).map(p => <ProductCard key={p.id} product={p} compact />)}
          </div>
        </section>
      )}

      {/* ─── CTA Section ─────────────────────────────── */}
      <section className="bg-terracotta-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Are you an Artisan?</h2>
          <p className="font-body text-lg text-terracotta-100 mt-3 max-w-2xl mx-auto">Join ODOP Marketplace and reach millions of customers. Sell your authentic handicrafts directly — no middlemen, fair prices.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-terracotta-600 font-medium rounded-lg hover:bg-cream-50 transition-all shadow-lg">
              Start Selling <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/cultural-hub" className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-all">
              Read Artisan Stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
