import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem('adminData');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  useEffect(() => {
    if (admin) {
      localStorage.setItem('adminData', JSON.stringify(admin)); // อัปเดตข้อมูลแอดมินใน localStorage
    } else {
      localStorage.removeItem('adminData');
      localStorage.removeItem('adminToken');
    }
  }, [admin]);

  const logout = () => {
    setAdmin(null); // ลบข้อมูลแอดมินจาก state
  };

  return (
    <AdminContext.Provider value={{ admin, setAdmin, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
