import React, { useEffect, useState } from 'react';
import './Login.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useUser } from './userContext';

const Login = ({ handleLoginSuccess }) => { // รับ handleLoginSuccess เป็น prop
  const { user,setUser } = useUser(); // เข้าถึง setUser จากบริบท
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if(user) {
      navigate('/result');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // ใช้ setPhone และ setPassword แทนการใช้ form
    if (name === 'phone') {
      setPhone(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/api/member/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser({ name: data.name }); // อัปเดตบริบทผู้ใช้
        localStorage.setItem('token', data.token);
        handleLoginSuccess(data.name);
        console.log(data.name); // เรียกใช้ฟังก์ชันที่ส่งมาจาก props
        console.log(data.token);
        Swal.fire({
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: data.message,
          icon: 'success',
          confirmButtonText: 'ตกลง',
        }).then(() => {
          navigate('/'); 
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
    <div className="login-form">
      <h2>เข้าสู่ระบบ</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="phone">เบอร์โทร:</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={phone} 
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
  );
};

export default Login;
