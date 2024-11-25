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
import Points from './components/point';


const App = () => {

  const [user, setUser] = useState(null); 
  const [phone,setPhone] = useState(null);

  const handleLoginSuccess = (name) => {
    setUser({ name }); 
    setPhone({phone});
  }

  return (
    <UserProvider value={{ user, setUser }}>
      <Router>
        <Navbar1 />
        <Routes>
          <Route path='*' element = {<NotFound />} />
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
              <PrivateRoute>
                <Ticket />
              </PrivateRoute>
            }
          />
          <Route path="/point"
            element={
              <PrivateRoute>
                <Points />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
