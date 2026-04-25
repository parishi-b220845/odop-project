import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Heart, Package, LogOut, LayoutDashboard,
  ChevronDown, MapPin, BookOpen, Headphones, Mic, MicOff, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { summary, fetchCart } = useCart();
  const { lang, switchLang, t, languages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => { if (user) fetchCart(); }, [user, fetchCart]);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => { setMobileOpen(false); setProfileOpen(false); setLangOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t('voiceNotSupported'));
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    const VOICE_LOCALES = { hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN' };
    recognition.lang = VOICE_LOCALES[lang] || 'en-IN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setListening(true);
      toast(t('listeningPrompt'), { icon: '🎙️', duration: 3000 });
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setSearchQuery(transcript);
    };

    recognition.onend = () => {
      setListening(false);
      // auto-submit if we got something
      if (searchInputRef.current?.value?.trim()) {
        navigate(`/products?search=${encodeURIComponent(searchInputRef.current.value.trim())}`);
        setSearchQuery('');
      }
    };

    recognition.onerror = () => {
      setListening(false);
      toast.error('Voice recognition error. Please try again.');
    };

    recognition.start();
  }, [lang, listening, navigate, t]);

  const handleLogout = () => { logout(); navigate('/'); };

  const SearchBar = ({ mobile = false }) => (
    <form onSubmit={handleSearch} className={`flex items-center ${mobile ? 'w-full' : 'flex-1 max-w-md mx-8'}`}>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={mobile ? undefined : searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-10 py-2.5 bg-cream-100 border border-cream-200 rounded-full text-sm font-body focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:bg-white transition-all"
        />
        <button
          type="button"
          onClick={startVoiceSearch}
          title="Voice search"
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors ${listening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-terracotta-500'}`}
        >
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>
    </form>
  );

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'}`}>
      {/* Top Banner */}
      <div className="bg-terracotta-500 text-white text-center py-1.5 text-xs font-body tracking-wide">
        <span className="opacity-90">{t('topBanner')} </span>
        <Link to="/explore" className="underline font-medium hover:text-saffron-200">{t('exploreMap')}</Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-terracotta-500 rounded-lg flex items-center justify-center group-hover:bg-terracotta-600 transition-colors">
              <span className="text-white text-lg">🏺</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-xl font-bold text-gray-900 leading-tight">ODOP</h1>
              <p className="text-[10px] text-gray-500 -mt-1 font-body tracking-widest uppercase">Marketplace</p>
            </div>
          </Link>

          {/* Search Bar — desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/products" className="btn-ghost text-sm">{t('products')}</Link>
            <Link to="/explore" className="btn-ghost text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{t('explore')}</Link>
            <Link to="/cultural-hub" className="btn-ghost text-sm flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{t('stories')}</Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-cream-100 transition-colors text-gray-600"
                title="Switch language"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:block">{lang.toUpperCase()}</span>
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-cream-200 py-1.5 animate-fade-in z-50">
                    {languages.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { switchLang(l.code); setLangOpen(false); }}
                        className={`flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-cream-50 transition-colors ${lang === l.code ? 'text-terracotta-600 font-semibold' : 'text-gray-700'}`}
                      >
                        <span>{l.native}</span>
                        {lang === l.code && <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {user ? (
              <>
                <Link to="/cart" className="relative p-2 rounded-lg hover:bg-cream-100 transition-colors">
                  <ShoppingCart className="w-5 h-5 text-gray-600" />
                  {summary.itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {summary.itemCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-cream-100 transition-colors">
                    <div className="w-8 h-8 bg-saffron-100 rounded-full flex items-center justify-center">
                      <span className="text-saffron-700 text-sm font-semibold">{user.name?.charAt(0)}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-cream-200 py-2 animate-fade-in">
                        <div className="px-4 py-2 border-b border-cream-100">
                          <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <span className="badge-saffron text-[10px] mt-1">{user.role}</span>
                        </div>
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50"><User className="w-4 h-4" />{t('profile')}</Link>
                        <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50"><Package className="w-4 h-4" />{t('myOrders')}</Link>
                        <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50"><Heart className="w-4 h-4" />My Wishlist</Link>
                        {user.role === 'seller' && (
                          <Link to="/seller/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50"><LayoutDashboard className="w-4 h-4" />{t('sellerDashboard')}</Link>
                        )}
                        {user.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50"><LayoutDashboard className="w-4 h-4" />{t('adminPanel')}</Link>
                        )}
                        <Link to="/support" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-50"><Headphones className="w-4 h-4" />{t('support')}</Link>
                        <hr className="my-1 border-cream-100" />
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"><LogOut className="w-4 h-4" />{t('logout')}</button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">{t('signIn')}</Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">{t('joinFree')}</Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-cream-100">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-cream-200 animate-slide-up">
          <div className="px-4 py-3">
            <SearchBar mobile />
          </div>
          <nav className="px-4 pb-4 space-y-1">
            <Link to="/products" className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-cream-50">{t('products')}</Link>
            <Link to="/explore" className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-cream-50">{t('explore')}</Link>
            <Link to="/cultural-hub" className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-cream-50">{t('stories')}</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
