import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import Home from './pages/buyer/Home';
import Products from './pages/buyer/Products';
import ProductDetail from './pages/buyer/ProductDetail';
import Cart from './pages/buyer/Cart';
import Checkout from './pages/buyer/Checkout';
import BuyerOrders from './pages/buyer/BuyerOrders';
import ExploreMap from './pages/buyer/ExploreMap';
import CulturalHub from './pages/buyer/CulturalHub';
import ArticleDetail from './pages/buyer/ArticleDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/auth/Profile';
import Support from './pages/buyer/Support';
import Wishlist from './pages/buyer/Wishlist';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

export default function App() {
  const { loading } = useAuth();
  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Toaster position="top-right" toastOptions={{
        style: { fontFamily: 'Outfit, sans-serif', borderRadius: '10px', background: '#333', color: '#fff' },
      }} />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/explore" element={<ExploreMap />} />
          <Route path="/cultural-hub" element={<CulturalHub />} />
          <Route path="/cultural-hub/:slug" element={<ArticleDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><BuyerOrders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/seller/dashboard" element={<ProtectedRoute roles={['seller']}><SellerDashboard /></ProtectedRoute>} />
          <Route path="/seller/products" element={<ProtectedRoute roles={['seller']}><SellerProducts /></ProtectedRoute>} />
          <Route path="/seller/orders" element={<ProtectedRoute roles={['seller']}><SellerOrders /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
