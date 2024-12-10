import React, { useState , useEffect} from 'react';
import './css/Register.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; 

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate(); 
  const [isOTPStage, setIsOTPStage] = useState(false);
  const [otpData, setOtpData] = useState({ phone: '', otp: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phonePattern = /^[0-9]{10}$/;
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
        Swal.fire({
          title: 'สำเร็จ!',
          text: data.message,
          icon: 'success',
          confirmButtonText: 'ตกลง',
        }).then(() => {
          navigate('/register/otpVerify', { state: { phone: form.phone } });
        });
        setForm({ name: '', email: '', phone: '', password: '' });
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
        text: 'เกิดข้อผิดพลาดในการลงทะเบียน',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
    }
  };
  
  if (isOTPStage) {
    return (
      <div className="otp-verification">
        <h2>ยืนยัน OTP</h2>
        <form onSubmit={handleVerifyOTP}>
          <div className="form-group">
            <label htmlFor="otp">OTP:</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otpData.otp} 
              onChange={(e) => setOtpData((prev) => ({ ...prev, otp: e.target.value }))} // อัปเดต otp
              required
            />

          </div>
          <button type="submit" className="submit-button">ยืนยัน</button>
        </form>
      </div>
    );
  }

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
          <label htmlFor="email">อีเมลล์:</label>
          <input
            type="text"
            id="email"
            name="email"
            value={form.email}
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
