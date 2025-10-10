import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';

// Pages
import UserLoginRegister from './pages/UserLoginRegister';
import AdminRegister from './pages/AdminRegister';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import ProductManager from './pages/ProductManager';
import ViewProducts from './pages/ViewProducts';
import SupplierManager from './pages/SupplierManager';
import CustomerManager from './pages/CustomerManager';
import InventoryManager from './pages/InventoryManager';
import OrderManager from './pages/OrderManager';
import FeedbackManager from './pages/FeedbackManager';
import DeliveryManager from './pages/DeliveryManager';
import UserProfile from './pages/UserProfile';

// Navbars
import Navbar from './components/Navbar';     
import NavbarPublic from './components/navPublic'; 

// Route guards
import UserRoute from './components/UserRoute';
import AdminRoute from './components/AdminRoute';

function AppContent() {
  const location = useLocation();

  // Define public paths where PublicNavbar should show
  const publicPaths = ['/', '/admin-register'];
  const isPublicPath = publicPaths.includes(location.pathname);

  return (
    <>
      {/* Conditional Navbar */}
      {isPublicPath ? <NavbarPublic /> : <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<UserLoginRegister />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/home" element={<Home />} />
        <Route path="/view-products" element={<ViewProducts />} />

        {/* User Routes */}
        <Route path="/profile" element={<UserRoute><UserProfile /></UserRoute>} />
        <Route path="/order-manager" element={<UserRoute><OrderManager /></UserRoute>} />
        <Route path="/supplier-manager" element={<UserRoute><SupplierManager /></UserRoute>} />
        <Route path="/product-manager" element={<UserRoute><ProductManager /></UserRoute>} />
        <Route path="/feedback-manager" element={<UserRoute><FeedbackManager /></UserRoute>} />
        <Route path="/delivery-manager" element={<UserRoute><DeliveryManager /></UserRoute>} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/customer-manager" element={<AdminRoute><CustomerManager /></AdminRoute>} />
        <Route path="/inventory-manager" element={<AdminRoute><InventoryManager /></AdminRoute>} />
      </Routes>

      <ToastContainer position="top-center" autoClose={1000} />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
