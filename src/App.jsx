import { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';
import { ProductProvider } from './context/ProductContext';
import { CustomerDataProvider } from './context/CustomerDataContext';
import { WishlistProvider } from './context/WishlistContext';
import { trackPageView } from './utils/pixel';
import { trackVisit } from './utils/analytics';
import { gaPageView } from './utils/ga';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartToast from './components/CartToast';
import WhatsAppButton from './components/WhatsAppButton';
import MotionLayer from './components/MotionLayer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
import About from './pages/About';
const CustomerOrders = lazy(() => import('./pages/customer/CustomerOrders'));
const CustomerTransactions = lazy(() => import('./pages/customer/CustomerTransactions'));
const CustomerAddresses = lazy(() => import('./pages/customer/CustomerAddresses'));
const CustomerProfile = lazy(() => import('./pages/customer/CustomerProfile'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminSubAdmins = lazy(() => import('./pages/admin/AdminSubAdmins'));
const AdminMarketing = lazy(() => import('./pages/admin/AdminMarketing'));
const AdminDrops = lazy(() => import('./pages/admin/AdminDrops'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminAbout = lazy(() => import('./pages/admin/AdminAbout'));
const AdminTracking = lazy(() => import('./pages/admin/AdminTracking'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Fires Meta Pixel PageView (for SPA route changes) + scrolls to top.
// The initial PageView + pixel init happen in index.html.
function PixelTracker() {
  const location = useLocation();
  const first = useRef(true);
  useEffect(() => { trackVisit(); }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    gaPageView(location.pathname);                 // GA4 page view (every route, incl. first)
    if (first.current) { first.current = false; return; } // index.html already fired the first Meta PageView
    trackPageView();
  }, [location.pathname]);
  return null;
}

function CustomerLayout({ children }) {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <MotionLayer />
      <Navbar />
      <main key={location.pathname} className="flex-1 page-enter">{children}</main>
      <Footer />
      <CartToast />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomerDataProvider>
          <ProductProvider>
            <CategoryProvider>
              <CartProvider>
                <WishlistProvider>
                <PixelTracker />
                <Suspense fallback={<div className="min-h-[60vh]" />}>
                <Routes>
                  {/* Admin portal login — desktop accessible */}
                  <Route path="/admin-login" element={<AdminLogin />} />

                  {/* Admin panel routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index              element={<Dashboard />}       />
                    <Route path="products"    element={<AdminProducts />}   />
                    <Route path="orders"      element={<AdminOrders />}     />
                    <Route path="users"       element={<AdminUsers />}      />
                    <Route path="analytics"   element={<AdminAnalytics />}  />
                    <Route path="categories"  element={<AdminCategories />} />
                    <Route path="sub-admins"  element={<AdminSubAdmins />}  />
                    <Route path="marketing"   element={<AdminMarketing />}  />
                    <Route path="drops"       element={<AdminDrops />}      />
                    <Route path="reviews"     element={<AdminReviews />}    />
                    <Route path="about"       element={<AdminAbout />}      />
                    <Route path="tracking"    element={<AdminTracking />}   />
                    <Route path="settings"    element={<AdminSettings />}   />
                    <Route path="profile"     element={<AdminProfile />}    />
                  </Route>

                  {/* Customer login — mobile only */}
                  <Route path="/login" element={<Login />} />

                  {/* Customer-facing routes */}
                  <Route path="/"                     element={<CustomerLayout><Home /></CustomerLayout>} />
                  <Route path="/products"             element={<CustomerLayout><Products /></CustomerLayout>} />
                  <Route path="/about"                element={<CustomerLayout><About /></CustomerLayout>} />
                  <Route path="/products/:id"         element={<CustomerLayout><ProductDetail /></CustomerLayout>} />
                  <Route path="/cart"                 element={<CustomerLayout><Cart /></CustomerLayout>} />
                  <Route path="/checkout"             element={<CustomerLayout><Checkout /></CustomerLayout>} />
                  <Route path="/account/orders"       element={<CustomerLayout><CustomerOrders /></CustomerLayout>} />
                  <Route path="/account/transactions" element={<CustomerLayout><CustomerTransactions /></CustomerLayout>} />
                  <Route path="/account/addresses"    element={<CustomerLayout><CustomerAddresses /></CustomerLayout>} />
                  <Route path="/account/profile"      element={<CustomerLayout><CustomerProfile /></CustomerLayout>} />
                  <Route path="/wishlist"             element={<CustomerLayout><Wishlist /></CustomerLayout>} />
                </Routes>
                </Suspense>
                </WishlistProvider>
              </CartProvider>
            </CategoryProvider>
          </ProductProvider>
        </CustomerDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
