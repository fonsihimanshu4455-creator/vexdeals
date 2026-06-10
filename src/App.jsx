import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';
import { ProductProvider } from './context/ProductContext';
import { CustomerDataProvider } from './context/CustomerDataContext';
import { trackPageView } from './utils/pixel';
import { trackVisit } from './utils/analytics';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartToast from './components/CartToast';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import About from './pages/About';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerTransactions from './pages/customer/CustomerTransactions';
import CustomerAddresses from './pages/customer/CustomerAddresses';
import CustomerProfile from './pages/customer/CustomerProfile';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSubAdmins from './pages/admin/AdminSubAdmins';
import AdminMarketing from './pages/admin/AdminMarketing';
import AdminProfile from './pages/admin/AdminProfile';
import AdminReviews from './pages/admin/AdminReviews';
import AdminAbout from './pages/admin/AdminAbout';
import AdminTracking from './pages/admin/AdminTracking';
import AdminSettings from './pages/admin/AdminSettings';

// Fires Meta Pixel PageView (for SPA route changes) + scrolls to top.
// The initial PageView + pixel init happen in index.html.
function PixelTracker() {
  const location = useLocation();
  const first = useRef(true);
  useEffect(() => { trackVisit(); }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (first.current) { first.current = false; return; } // index.html already fired the first PageView
    trackPageView();
  }, [location.pathname]);
  return null;
}

function CustomerLayout({ children }) {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main key={location.pathname} className="flex-1 animate-fade-in">{children}</main>
      <Footer />
      <CartToast />
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
                <PixelTracker />
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
                </Routes>
              </CartProvider>
            </CategoryProvider>
          </ProductProvider>
        </CustomerDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
