import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Box } from '@mui/material';
import './css/AdminDashboard.css';
import Swal from "sweetalert2";
import Loading from "./Loading";
const apiUrl = import.meta.env.VITE_API_URL;


const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [reserveCount, setReserveCount] = useState(0);
  const navigate = useNavigate();

  // ดึงข้อมูลแอดมินจาก localStorage
  useEffect(() => {
    const savedAdmin = JSON.parse(localStorage.getItem('adminData'));
    if (savedAdmin) {
      setAdmin(savedAdmin);
    } else {
      <Loading />
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่มีToken โปรดลองอีกครั้ง',
      }).then(() => navigate('/'));
    }

    // ดึงข้อมูลจำนวนผู้ใช้งาน
    axios.get(`${apiUrl}/api/users/count`)
      .then((response) => {
        setUserCount(response.data.count);
      })
      .catch((error) => {
        console.error('Error fetching user count:', error);
      });

    // ดึงข้อมูลจำนวนการจอง
    axios.get(`${apiUrl}/api/reserves/count`)
      .then((response) => {
        setReserveCount(response.data.count);
      })
      .catch((error) => {
        console.error('Error fetching reserve count:', error);
      });
  }, [navigate]);

  return (
    <div className="admin-dashboard">
      <Container maxWidth="lg">
        <div className="dashboard-header">
          <Typography variant="h3" gutterBottom>แดชบอร์ดแอดมิน</Typography>
          {admin && <Typography variant="h6">ยินดีต้อนรับ, {admin.username}!</Typography>}
        </div>

        <div className="dashboard-content">
          <Typography variant="h5" gutterBottom>ข้อมูลสรุป</Typography>

          {/* ใช้ Box แทน Grid */}
          <Box
            display="flex"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={3}
            marginTop={2}
          >
            <Card sx={{ minHeight: 200, backgroundColor: '#1976d2', color: 'white', flex: '1 1 calc(33% - 1rem)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>จำนวนผู้ใช้งาน</Typography>
                <Typography variant="h4">{userCount} คน</Typography>
              </CardContent>
            </Card>

            <Card sx={{ minHeight: 200, backgroundColor: '#388e3c', color: 'white', flex: '1 1 calc(33% - 1rem)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>จำนวนการจองสนาม</Typography>
                <Typography variant="h4">{reserveCount} ครั้ง</Typography>
              </CardContent>
            </Card>
          </Box>
        </div>
      </Container>
    </div>
  );
};

export default AdminDashboard;
