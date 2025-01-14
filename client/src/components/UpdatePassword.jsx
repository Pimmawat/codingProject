import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import './css/UpdatePassword.css'; // สร้างไฟล์ CSS ตามต้องการ
const apiUrl = import.meta.env.VITE_API_URL;
import Loading from './Loading';
import { useNavigate } from 'react-router-dom';

const UpdatePassword = () => {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false); // สถานะการโหลด
    const navigate = useNavigate();

    const token = searchParams.get('token'); // รับ token จาก URL

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'รหัสผ่านไม่ตรงกัน',
                text: 'กรุณากรอกข้อมูลให้ตรงกัน',
            });
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/auth/update-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ!',
                    text: result.message || 'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว',
                });
                setLoading(false);
                navigate('/login');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด!',
                    text: result.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้',
                });
                setLoading(false);
            }
        } catch (err) {
            console.error('Error:', err);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง',
            });
            setLoading(false);
        }
    };
    if (loading) {
        return <Loading />;
      }

    return (
        <div className="update-password-container">
            <h2 className="heading">อัปเดตรหัสผ่านใหม่</h2>
            <form className="update-password-form" onSubmit={handleSubmit}>
                <label htmlFor="newPassword">รหัสผ่านใหม่</label>
                <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="กรุณากรอกรหัสผ่านใหม่"
                />
                <label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="กรุณายืนยันรหัสผ่านใหม่"
                />
                <button type="submit">อัปเดตรหัสผ่าน</button>
            </form>
        </div>
    );
};

export default UpdatePassword;
