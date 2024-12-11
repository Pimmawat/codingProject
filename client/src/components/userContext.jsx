import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  const logout = () => {
    setUser(null); // ลบ user จาก state
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}> {/* ส่งออก logout ด้วย */}
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); // hook สำหรับใช้งาน user context
