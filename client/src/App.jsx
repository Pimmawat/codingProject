import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './components/userContext';
import Register from './components/Register';
import Login from './components/login';
import Booking from './components/booking';
import Navbar1 from './components/navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './components/Home';
import Payment from './components/payment';

const App = () => {

  const [user, setUser] = useState(null); // สถานะผู้ใช้

  const handleLoginSuccess = (name) => {
    setUser({ name }); // อัปเดตชื่อผู้ใช้ที่ล็อกอิน
  }

  return (
    <UserProvider value={{ user, setUser }}>
      <Router>
        <Navbar1 />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login handleLoginSuccess={handleLoginSuccess} />} />
          <Route path="/" element={<Home />} />
          <Route path="/booking"
            element={
              <PrivateRoute>
                <Booking />
              </PrivateRoute>
            }
          />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </Router>

    </UserProvider>
  );
};

export default App;
