import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import './css/ResetPassword.css';
const apiUrl = import.meta.env.VITE_API_URL;


const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // ตรวจสอบโทเค็น
        if (!token) {
            setError('ลิงก์ไม่ถูกต้อง');
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'ลิงก์ไม่ถูกต้อง',
            });
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword) {
            setError('กรุณากรอกรหัสผ่านใหม่');
            Swal.fire({
                icon: 'warning',
                title: 'กรุณากรอกรหัสผ่านใหม่',
                text: 'กรุณากรอกรหัสผ่านใหม่ก่อนดำเนินการ',
            });
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/auth/resetpassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: newPassword, resetToken: token }),
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess(result.message || 'รีเซ็ตรหัสผ่านสำเร็จ');
                setError('');
                Swal.fire({
                    icon: 'success',
                    title: 'รีเซ็ตรหัสผ่านสำเร็จ',
                    text: result.message || 'รีเซ็ตรหัสผ่านสำเร็จ',
                });
                navigate('/login'); // นำผู้ใช้กลับไปที่หน้า login
            } else {
                setError(result.message || 'ไม่สามารถดำเนินการได้');
                setSuccess('');
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด!',
                    text: result.message || 'ไม่สามารถดำเนินการได้',
                });
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
            setSuccess('');
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'กรุณาลองใหม่อีกครั้ง',
            });
        }
    };

    return (
        <div className="reset-password-container">
            <h2 className="heading">รีเซ็ตรหัสผ่าน</h2>
            <form className="reset-password-form" onSubmit={handleSubmit}>
                <label htmlFor="newPassword">รหัสผ่านใหม่:</label>
                <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="กรุณากรอกรหัสผ่านใหม่"
                />
                <button type="submit">บันทึกรหัสผ่านใหม่</button>
            </form>
        </div>
    );
};

export default ResetPassword;
