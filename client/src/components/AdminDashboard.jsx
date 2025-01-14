import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Box, CircularProgress } from '@mui/material';
import './css/AdminDashboard.css';
import Swal from "sweetalert2";

const apiUrl = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [reserveCount, setReserveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedAdmin = JSON.parse(localStorage.getItem('adminData'));
    if (savedAdmin) {
      setAdmin(savedAdmin);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่มี Token โปรดลองอีกครั้ง',
      }).then(() => navigate('/'));
    }

    const fetchData = async () => {
      try {
        const userResponse = await axios.get(`${apiUrl}/api/users/count`);
        setUserCount(userResponse.data.count);

        const reserveResponse = await axios.get(`${apiUrl}/api/reserves/count`);
        setReserveCount(reserveResponse.data.count);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="admin-dashboard-wrapper">
        <CircularProgress color="primary" />
      </div>
    );
  }

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard-overlay"></div>

      <div className="admin-dashboard">
        <Container maxWidth="lg" >
          <div className="dashboard-header">
            <Typography variant="h3" gutterBottom>แดชบอร์ดแอดมิน</Typography>
            {admin && <Typography variant="h6">ยินดีต้อนรับ, {admin.username}!</Typography>}
          </div>

          <div className="dashboard-content">
            <Typography variant="h5" gutterBottom>ข้อมูลสรุป</Typography>

            <Box
              display="flex"
              justifyContent="center"
              flexWrap="wrap"
              gap={3}
              marginTop={2}
            >
              <Card sx={{ backgroundColor: '#1976d2', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>จำนวนผู้ใช้งาน</Typography>
                  <Typography variant="h4">{userCount} คน</Typography>
                </CardContent>
              </Card>

              <Card sx={{ backgroundColor: '#388e3c', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>จำนวนการจองสนาม</Typography>
                  <Typography variant="h4">{reserveCount} ครั้ง</Typography>
                </CardContent>
              </Card>
            </Box>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;
