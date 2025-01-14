import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from './userContext';
import './css/Profile.css';
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';
const apiUrl = import.meta.env.VITE_API_URL;

const Profile = () => {
    const { user, setUser, logout } = useUser();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        created_at: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const formatDate = (date) => {
        return new Date(date).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });
    };

    useEffect(() => {
        setLoading(true);
        if (user?.id) {
            axios
                .get(`${apiUrl}/api/profile${user.id}`)
                .then((response) => {
                    const { name, email, phone, password, created_at } = response.data;
                    setFormData({
                        name: name || "",
                        email: email || "",
                        phone: phone || "",
                        password: password || "",
                        created_at: created_at || "",
                    });
                })
                .catch((error) => {
                    console.error("Error fetching profile:", error);
                    setMessage("ไม่สามารถดึงข้อมูลโปรไฟล์ได้");
                }).finally(() => setLoading(false));
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            return setMessage("กรุณากรอกข้อมูลให้ครบ");
        }

        setLoading(true);
        setMessage("");
        axios
            .put(`${apiUrl}/api/profile/${user.id}`, formData)
            .then(() => {
                Swal.fire({
                    title: 'ข้อมูลได้รับการอัปเดต',
                    text: 'คุณจะถูกออกจากระบบ กรุณาเข้าสู่ระบบอีกครั้ง',
                    icon: 'success',
                    confirmButtonText: 'ตกลง',
                }).then(() => {
                    logout();
                    navigate('/login');
                });
            })
            .catch((error) => {
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด',
                    text: error.message,
                    icon: 'warning',
                    confirmButtonText: 'ตกลง',
                })
                console.error("Error updating profile:", error.response?.data || error.message);
                setMessage("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="profile-container-wrapper">
            <div className="profile-overlay"></div>
            <div className="profile-container">
                <h1>แก้ไขโปรไฟล์</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label>ชื่อ:</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>เบอร์โทร:</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>อีเมล:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                readOnly
                            />
                        </div>
                        <div>
                            <label>สร้างเมื่อ:</label>
                            <input
                                type="text"
                                name="created_at"
                                value={formatDate(formData.created_at)}
                                onChange={handleInputChange}
                                readOnly
                            />
                        </div>
                        <a href="/forgetpassword">ลืมรหัสผ่าน</a>
                        <button type="submit">บันทึก</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;
