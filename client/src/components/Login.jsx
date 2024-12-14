import React, { useEffect, useState } from 'react';
import './css/Login.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useUser } from './userContext';
const apiUrl = import.meta.env.VITE_API_URL;

const Login = ({ handleLoginSuccess }) => {
  const { user, setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/ticket');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/api/member/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          point: data.point,
        });
        localStorage.setItem('token', data.token);
        handleLoginSuccess(data);
        Swal.fire({
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: data.message,
          icon: 'success',
          confirmButtonText: 'ตกลง',
        }).then(() => {
          navigate('/ticket');
        });
      } else {
        Swal.fire({
          title: 'ข้อผิดพลาด!',
          text: data.message,
          icon: 'error',
          confirmButtonText: 'ตกลง',
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
    }
  };

  return (
    <>
      <div className="login-form">
        <h2>เข้าสู่ระบบ</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">อีเมลล์:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
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
        <div className='admin-con'>
          <a href="/admin/login">สำหรับแอดมิน</a>
        </div>
      </div>
    </>
  );
};

export default Login;
