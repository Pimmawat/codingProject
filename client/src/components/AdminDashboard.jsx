import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Card, CardContent, Box, CircularProgress } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Swal from "sweetalert2";
import './css/AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const apiUrl = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [reserveCount, setReserveCount] = useState(0);
  const [cancelCount, setCancelCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dailyReserves, setDailyReserves] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
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
    
        const cancelResponse = await axios.get(`${apiUrl}/api/cancel/count`);
        setCancelCount(cancelResponse.data.count);
    
        const dailyReservesResponse = await axios.get(`${apiUrl}/api/reserves/daily`);
        const formattedReserves = dailyReservesResponse.data.map(item => ({
          ...item,
          date: new Date(item.date).toLocaleDateString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        }));
        setDailyReserves(formattedReserves);
    
        const response = await axios.get(`${apiUrl}/api/revenue/daily`);
        const formatted = response.data.map(item => ({
          ...item,
          date: new Date(item.date).toLocaleDateString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        }));
        setDailyRevenue(formatted);
    
      } catch (error) {  // catch ใช้ตัวแปร error
        console.error('Error fetching data:', error); // ใช้ตัวแปร error
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถดึงข้อมูลได้',
          text: `เกิดข้อผิดพลาด: ${error.message}`, // แสดงข้อความข้อผิดพลาด
        });
      } finally {
        setLoading(false); // ไม่ว่าจะเกิดข้อผิดพลาดหรือไม่ก็จะทำการตั้งค่า loading เป็น false
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

  const chartData = {
    labels: dailyReserves.map(item => item.date),
    datasets: [
      {
        label: 'จำนวนการจองต่อวัน',
        data: dailyReserves.map(item => item.count),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };
  const revenueChartData = {
    labels: dailyRevenue.map(item => item.date),
    datasets: [
      {
        label: 'รายได้รวมต่อวัน',
        data: dailyRevenue.map(item => item.revenue), // สมมติว่า field นี้มีชื่อว่า revenue
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard-overlay"></div>

      <div className="admin-dashboard">
        <Container maxWidth="lg">
          <div className="dashboard-header">
            <Typography variant="h3" gutterBottom>แดชบอร์ดแอดมิน</Typography>
            {admin && <Typography variant="h6">ยินดีต้อนรับ, {admin.username}!</Typography>}
          </div>

          <div className="dashboard-content">
            <Typography variant="h5" gutterBottom>ข้อมูลสรุป</Typography>

            <Box display="flex" justifyContent="center" flexWrap="wrap" gap={3} marginTop={2}>
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

              <Card sx={{ backgroundColor: 'red', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>คำขอยกเลิกการจอง</Typography>
                  <Typography variant="h4">{cancelCount} ครั้ง</Typography>
                </CardContent>
              </Card>
            </Box>

            <Typography variant="h5" gutterBottom marginTop={4}>สถิติการจองรายวัน</Typography>
            <Card>
              <CardContent>
                <Line data={chartData} />
              </CardContent>
            </Card>

            <Typography variant="h5" gutterBottom marginTop={4}>กราฟรายได้รวมต่อวัน</Typography>
            <Card>
              <CardContent>
                <Line data={revenueChartData} />
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;
