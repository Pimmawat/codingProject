import React, { useState,useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import Loading from './Loading';
const apiUrl = import.meta.env.VITE_API_URL;

const OtpVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || ''; // รับค่า phone จาก state ที่ส่งมาจาก Register.jsx
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkOtpExpiry = async () => {
        try {
          const response = await fetch(`${apiUrl}/api/member/check-otp-expiry`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone }),
          });
          const data = await response.json();

        if (!response.ok) {
          Swal.fire({
            title: 'ข้อผิดพลาด!',
            text: data.message,
            icon: 'error',
            confirmButtonText: 'ตกลง',
          }).then(() => {
            navigate('/register'); // หาก OTP หมดอายุ ให้กลับไปหน้าลงทะเบียน
          });
        }
      } catch (error) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: 'ไม่สามารถตรวจสอบสถานะ OTP ได้',
          icon: 'error',
          confirmButtonText: 'ตกลง',
        });
      }
    };

    if (!phone) {
      setIsLoading(true);
      setTimeout(() => {
        Swal.fire({
          title: 'ข้อผิดพลาด!',
          text: 'ไม่พบหมายเลขโทรศัพท์ โปรดลองลงทะเบียนใหม่',
          icon: 'error',
          confirmButtonText: 'ตกลง',
        }).then(() => {
          navigate('/register');
        });
      }, 2000); 
    }else{
        checkOtpExpiry();
    }
  }, [phone, navigate]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${apiUrl}/api/member/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'ยืนยันสำเร็จ!',
          text: data.message,
          icon: 'success',
          confirmButtonText: 'ตกลง',
        }).then(() => {
          navigate('/login');
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
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการยืนยัน OTP',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
    }
  };
  if (isLoading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="otp-verification">
      <h2>ยืนยัน OTP</h2>
      <form onSubmit={handleVerifyOTP}>
        <div className="form-group">
          <label htmlFor="otp">OTP:</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">ยืนยัน</button>
      </form>
    </div>
  );
};

export default OtpVerify;
