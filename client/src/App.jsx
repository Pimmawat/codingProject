import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './components/userContext';
import Register from './components/Register';
import Login from './components/Login';
import Booking from './components/booking';
import Navbar1 from './components/navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './components/Home';
import Payment from './components/payment';
import Ticket from './components/Ticket';

const App = () => {

  const [user, setUser] = useState(null); // สถานะผู้ใช้
  const [phone,setPhone] = useState(null);

  const handleLoginSuccess = (name) => {
    setUser({ name }); // อัปเดตชื่อผู้ใช้ที่ล็อกอิน
    setPhone({phone});
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
          <Route path="/payment" 
          element={
          <PrivateRoute>
            <Payment/>
          </PrivateRoute>
          }
          />
          <Route path="/ticket"
            element={
                <Ticket />
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
