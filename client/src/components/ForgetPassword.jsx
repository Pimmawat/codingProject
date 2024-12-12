import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './css/ForgetPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // ตรวจสอบว่ามีข้อมูลผู้ใช้ใน localStorage หรือไม่
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.email) {
            setEmail(user.email); // ตั้งค่า email ในฟอร์มให้เป็น email ของผู้ใช้
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3001/api/auth/forgetpassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: result.message || 'ลิงก์รีเซ็ตรหัสผ่านได้ถูกส่งไปยังอีเมลของคุณแล้ว',
                });
                setError('');
            } else {
                // แสดงข้อผิดพลาด
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด!',
                    text: result.message || 'ไม่สามารถดำเนินการได้',
                });
                setMessage('');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'กรุณาลองใหม่อีกครั้ง',
            });
            setMessage('');
        }
    };

    return (
        <div className="forgot-password-container">
            <h2 className="heading">ลืมรหัสผ่าน</h2>
            <form className="forgot-password-form" onSubmit={handleSubmit}>
                <label htmlFor="email">รีเซ็ทรหัสโดยใช้อีเมลล์นี้เท่านั้น!</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="กรุณากรอกอีเมลของคุณ"
                    readOnly
                />
                <button type="submit">ส่งลิงก์รีเซ็ตรหัสผ่าน</button>
            </form>
        </div>
    );
};

export default ForgotPassword;
