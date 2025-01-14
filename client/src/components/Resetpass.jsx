import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './css/Resetpass.css';
import Loading from './Loading';
import { useNavigate } from 'react-router-dom'
const apiUrl = import.meta.env.VITE_API_URL;

const Resetpass = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false); // สถานะการโหลด
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${apiUrl}/api/auth/resetpass`, {
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
                setEmail('');
                setLoading(false);
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด!',
                    text: result.message || 'ไม่สามารถดำเนินการได้',
                });
                setLoading(false);
            }
        } catch (err) {
            console.error('Error:', err);
            setLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง',
            });
        }

    };
    if (loading) {
        return <Loading />;
      }

    return (
        <div className="resetpass-container">
            <h2 className="heading">รีเซ็ตรหัสผ่าน</h2>
            <form className="resetpass-form" onSubmit={handleSubmit}>
                <label htmlFor="email">อีเมล</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="กรุณากรอกอีเมลของคุณ"
                />
               <button type="submit" disabled={loading}>
                    {loading ? 'กำลังโหลด...' : 'เปลี่ยนรหัสผ่าน'}
                </button>
            </form>
        </div>
    );
};

export default Resetpass;
