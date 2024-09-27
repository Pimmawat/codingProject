import React, { useState } from 'react';
import './Register.css'; // นำเข้าไฟล์ CSS
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; // นำเข้า useNavigate

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
  });
  
  const navigate = useNavigate(); // สร้าง instance ของ useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // ตรวจสอบรูปแบบเบอร์โทร
    const phonePattern = /^[0-9]{10}$/; // ปรับตามรูปแบบเบอร์โทรที่ต้องการ
    if (!phonePattern.test(form.phone)) {
      return Swal.fire({
        title: 'ข้อผิดพลาด!',
        text: 'กรุณากรอกเบอร์โทรในรูปแบบที่ถูกต้อง',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
    }
  
    try {
      const response = await fetch('http://localhost:3001/api/member/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // แสดง SweetAlert2 สำหรับข้อความสำเร็จ
        Swal.fire({
          title: 'สำเร็จ!',
          text: data.message,
          icon: 'success',
          confirmButtonText: 'ตกลง',
        }).then(() => {
          navigate('/login'); // นำทางไปยังหน้า Login เมื่อผู้ใช้กดตกลง
        });
  
        setForm({ name: '', phone: '', password: '' }); // ล้างฟอร์มหลังจากลงทะเบียนสำเร็จ
      } else {
        // แสดง SweetAlert2 สำหรับข้อผิดพลาด
        Swal.fire({
          title: 'ข้อผิดพลาด!',
          text: data.message,
          icon: 'error',
          confirmButtonText: 'ตกลง',
        });
      }
    } catch (error) {
      console.error(error);
      // แสดง SweetAlert2 สำหรับข้อผิดพลาดในการเชื่อมต่อ
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลงทะเบียน',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
    }
  };

  return (
    <div className="register-form">
      <h2>ลงทะเบียน</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">ชื่อ:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">เบอร์โทร:</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={form.phone}
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
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-button">ลงทะเบียน</button>
      </form>
    </div>
  );
};

export default Register;
