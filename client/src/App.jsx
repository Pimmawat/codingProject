import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './components/userContext';
import Register from './components/Register';
import Login from './components/Login';
import Booking from './components/booking';
import Navbar1 from './components/navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './components/Home';
import Payment from './components/Payment';
import Ticket from './components/Ticket';
import NotFound from './components/404notfound';
import Points from './components/Points';
import OtpVerify from './components/OtpVerify';
import BookingFree from './components/BookingFree';
import Redeem from './components/Redeem';
import Profile from './components/Profile';
import ForgetPassword from './components/ForgetPassword';
import ResetPassword from './components/ResetPassword';
// admin
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminBookings from './components/AdminBookings';

const App = () => {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState(null);

  const handleLoginSuccess = (name) => {
    setUser({ name });
    setPhone({ phone });
  };

  return (
    <> 
      <UserProvider value={{ user, setUser }}>
        <Router>
          <Navbar1 />
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/otpVerify" element={<OtpVerify />} />
            <Route path="/login" element={<Login handleLoginSuccess={handleLoginSuccess} />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />         
            {/* Private Routes */}
            <Route
              path="/forgetpassword"
              element={
                <PrivateRoute>
                  <ForgetPassword />
                </PrivateRoute>
              }
            />
            <Route
              path="/resetpassword/:token"
              element={
                <PrivateRoute>
                  <ResetPassword />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/forgetpassword"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/booking"
              element={
                <PrivateRoute>
                  <Booking />
                </PrivateRoute>
              }
            />
            <Route
              path="/booking/payment"
              element={
                <PrivateRoute>
                  <Payment />
                </PrivateRoute>
              }
            />
            <Route
              path="/ticket"
              element={
                <PrivateRoute>
                  <Ticket />
                </PrivateRoute>
              }
            />
            <Route
              path="/points"
              element={
                <PrivateRoute>
                  <Points />
                </PrivateRoute>
              }
            />
            <Route
              path="/redeem/booking"
              element={
                <PrivateRoute>
                  <BookingFree />
                </PrivateRoute>
              }
            />
            <Route
              path="/redeem"
              element={
                <PrivateRoute>
                  <Redeem />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </UserProvider>
    </>
  );
};

export default App;
