import React, { useEffect, useState } from 'react';
import './css/AdminLogin.css'; // นำเข้าไฟล์ CSS
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';


const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3001/api/admin/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, password }),
            });
      
            const data = await response.json();
            if (response.ok) {
              Swal.fire({
                title: 'เข้าสู่ระบบสำเร็จ!',
                text: data.message,
                icon: 'success',
                confirmButtonText: 'ตกลง',
              }).then(() => {
                navigate('/admin/dashboard'); 
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
            <div className="login-box">
                <h2>Admin Login</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">Login</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
