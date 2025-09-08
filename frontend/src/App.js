import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import HomePage from "./customer/pages/HomePage/HomePage";
import ShopPage from "./customer/pages/Shop/ShopPage";
import Navigation from "./customer/components/Navigation/Navigation";
import Login from './components/Auth/Login';
import SignUp from "./components/Auth/Signup";
import Profile from './customer/pages/Profile';
import ProductDetails from "./customer/components/ShopPage/ProductDetails";
import ContactPage from "./customer/pages/Contact/Contact";   
import OwnerStock from "./customer/pages/OwnerStock";
import LimitedItems from "./customer/pages/LimitedItems";
import CartPage from "./customer/pages/CartPage";
import SplashScreen from "./customer/components/SplashScreen"; // ✅ import Splash
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {loading ? (
            <SplashScreen onFinish={() => setLoading(false)} />
          ) : (
            <>
              <Navigation />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/owner/stock" element={<OwnerStock />} />
                <Route path="/owner/limited" element={<LimitedItems />} />
                <Route path="/cart" element={<CartPage />} />
              </Routes>
            </>
          )}
        </Router>
        <ToastContainer position="top-right" autoClose={2000} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
