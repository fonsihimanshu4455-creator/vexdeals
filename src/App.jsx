import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CategoryProvider } from './context/CategoryContext';
import { ProductProvider } from './context/ProductContext';
import { CustomerDataProvider } from './context/CustomerDataContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import LiveActivity from './components/LiveActivity';

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

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSubAdmins from './pages/admin/AdminSubAdmins';
import AdminMarketing from './pages/admin/AdminMarketing';

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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomerDataProvider>
          <ProductProvider>
            <CategoryProvider>
              <CartProvider>
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
                  </Route>

                  {/* Customer login — mobile only */}
                  <Route path="/login" element={<Login />} />

                  {/* Customer-facing routes */}
                  <Route path="/"                     element={<CustomerLayout><Home /></CustomerLayout>} />
                  <Route path="/products"             element={<CustomerLayout><Products /></CustomerLayout>} />
                  <Route path="/products/:id"         element={<CustomerLayout><ProductDetail /></CustomerLayout>} />
                  <Route path="/cart"                 element={<CustomerLayout><Cart /></CustomerLayout>} />
                  <Route path="/checkout"             element={<CustomerLayout><Checkout /></CustomerLayout>} />
                  <Route path="/account/orders"       element={<CustomerLayout><CustomerOrders /></CustomerLayout>} />
                  <Route path="/account/transactions" element={<CustomerLayout><CustomerTransactions /></CustomerLayout>} />
                  <Route path="/account/addresses"    element={<CustomerLayout><CustomerAddresses /></CustomerLayout>} />
                </Routes>
              </CartProvider>
            </CategoryProvider>
          </ProductProvider>
        </CustomerDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
