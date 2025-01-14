import React, { useState } from 'react';
import './css/AdminLogin.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';

const apiUrl = import.meta.env.VITE_API_URL;

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // ตัวแปร loading
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // เริ่มแสดงหน้า Loading
    try {
      const response = await fetch(`${apiUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        Swal.fire({
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: data.message,
          icon: 'success',
          confirmButtonText: 'ตกลง',
        }).then(() => {
          setLoading(false); // หยุดหน้า Loading
          navigate('/admin/dashboard');
        });
      } else {
        setLoading(false); // หยุดหน้า Loading
        Swal.fire({
          title: 'ข้อผิดพลาด!',
          text: data.message,
          icon: 'error',
          confirmButtonText: 'ตกลง',
        });
      }
    } catch (error) {
      setLoading(false); // หยุดหน้า Loading
      console.error(error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
    }
  };

  // ถ้า loading เป็น true ให้แสดงหน้า Loading
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-login-container-wrapper">
      <div className="admin-login-overlay"></div>
      <div className="login-form">
        <h2>เข้าสู่ระบบแอดมิน</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">อีเมลล์:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-button">เข้าสู่ระบบ</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
