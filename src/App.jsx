import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';
import { BrandProvider } from './context/BrandContext';
import { ProductProvider } from './context/ProductContext';
import { TestimonialProvider } from './context/TestimonialContext';
import { CustomerDataProvider } from './context/CustomerDataContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import ScrollToTop from './components/ScrollToTop';
import LiveActivity from './components/LiveActivity';

// Customer pages — eager so SPA navigation is instant after first load
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerTransactions from './pages/customer/CustomerTransactions';
import CustomerAddresses from './pages/customer/CustomerAddresses';
import CustomerProfile from './pages/customer/CustomerProfile';

// Admin panel — lazy so customers never download these chunks
const AdminLayout       = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard         = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts     = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders       = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers        = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnalytics    = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminCategories   = lazy(() => import('./pages/admin/AdminCategories'));
const AdminBrands       = lazy(() => import('./pages/admin/AdminBrands'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));
const AdminSubAdmins    = lazy(() => import('./pages/admin/AdminSubAdmins'));
const AdminMarketing    = lazy(() => import('./pages/admin/AdminMarketing'));

function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <Navbar />
      <main className="flex-1">{children}</main>
      <LiveActivity />
      <Footer />
    </div>
  );
}

function AdminFallback() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-mesh-light">
      <div className="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CustomerDataProvider>
          <CategoryProvider>
            <BrandProvider>
              <ProductProvider>
                <TestimonialProvider>
                  <CartProvider>
                    <Suspense fallback={<AdminFallback />}>
                  <Routes>
                    <Route path="/admin-login" element={<AdminLogin />} />

                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index               element={<Dashboard />}        />
                      <Route path="products"     element={<AdminProducts />}    />
                      <Route path="orders"       element={<AdminOrders />}      />
                      <Route path="users"        element={<AdminUsers />}       />
                      <Route path="analytics"    element={<AdminAnalytics />}   />
                      <Route path="categories"   element={<AdminCategories />}  />
                      <Route path="brands"       element={<AdminBrands />}      />
                      <Route path="testimonials" element={<AdminTestimonials />}/>
                      <Route path="sub-admins"   element={<AdminSubAdmins />}   />
                      <Route path="marketing"    element={<AdminMarketing />}   />
                    </Route>

                    <Route path="/login" element={<Login />} />

                    <Route path="/"                     element={<CustomerLayout><Home /></CustomerLayout>} />
                    <Route path="/products"             element={<CustomerLayout><Products /></CustomerLayout>} />
                    <Route path="/products/:id"         element={<CustomerLayout><ProductDetail /></CustomerLayout>} />
                    <Route path="/cart"                 element={<CustomerLayout><Cart /></CustomerLayout>} />
                    <Route path="/checkout"             element={<CustomerLayout><Checkout /></CustomerLayout>} />
                    <Route path="/account"              element={<CustomerLayout><CustomerProfile /></CustomerLayout>} />
                    <Route path="/account/profile"      element={<CustomerLayout><CustomerProfile /></CustomerLayout>} />
                    <Route path="/account/orders"       element={<CustomerLayout><CustomerOrders /></CustomerLayout>} />
                    <Route path="/account/transactions" element={<CustomerLayout><CustomerTransactions /></CustomerLayout>} />
                    <Route path="/account/addresses"    element={<CustomerLayout><CustomerAddresses /></CustomerLayout>} />
                  </Routes>
                </Suspense>
                  </CartProvider>
                </TestimonialProvider>
              </ProductProvider>
            </BrandProvider>
          </CategoryProvider>
        </CustomerDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
