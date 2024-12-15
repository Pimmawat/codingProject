import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Paper,
    Typography,
    TextField,
    Box,
} from "@mui/material";
import Swal from "sweetalert2";
import './css/AdminBookings.css';
import Loading from "./Loading";
const apiUrl = import.meta.env.VITE_API_URL;

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [admin, setAdmin] = useState();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const getUserName = (userId) => {
        const user = users.find((u) => u.id === userId);
        return user ? user.name : "ไม่พบชื่อ";
    };

    // ดึงข้อมูลการจองจาก API
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
        axios.get(`${apiUrl}/api/admin/bookings`)
            .then((response) => {
                setBookings(response.data);
            })
            .catch((error) => {
                console.error("Error fetching bookings:", error);
            });
        axios.get(`${apiUrl}/api/admin/users`)
            .then((response) => {
                setUsers(response.data);
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
            });
    }, []);

    // ฟังก์ชันลบการจอง
    const handleDelete = (booking_id) => {
        Swal.fire({
            title: "คุณต้องการลบการจองนี้หรือไม่?",
            text: "ข้อมูลที่ลบแล้วจะไม่สามารถกู้คืนได้!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ใช่, ลบเลย!",
            cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`${apiUrl}/api/admin/bookings/${booking_id}`)
                    .then(() => {
                        setBookings(bookings.filter((booking) => booking.booking_id !== booking_id));
                        Swal.fire("ลบสำเร็จ!", "การจองถูกลบเรียบร้อยแล้ว", "success");
                    })
                    .catch((error) => {
                        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบการจองได้", "error");
                        console.error("Error deleting booking:", error);
                    });
            }
        });
    };

    // กรองข้อมูลการจองตามชื่อผู้ใช้งานหรือสนาม
    const filteredBookings = bookings.filter(
        (booking) =>
            (getUserName(booking.user_id) && getUserName(booking.user_id).toString().includes(searchQuery)) || // ค้นหาโดย user_id
            (booking.field && booking.field.toLowerCase().includes(searchQuery)) // ค้นหาโดย field

    );

    // แปลงวันที่ให้อยู่ในรูปแบบที่อ่านง่าย
    const formatDate = (date) => {
        return new Date(date).toLocaleString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
        });
    };
    const formatDateNoTime = (date) => {
        return new Date(date).toLocaleString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <Container sx={{ marginTop: 20 }}>
            <Box sx={{ textAlign: "center", marginBottom: 2 }}>
                <Typography variant="h4" gutterBottom>
                    จัดการการจองสนาม
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    ค้นหาและจัดการการจองทั้งหมดในระบบ
                </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    placeholder="ค้นหา"
                    variant="outlined"
                    fullWidth
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        boxShadow: 3,
                        borderRadius: "8px",
                    }}
                />
            </Box>


            <TableContainer component={Paper} sx={{
                borderRadius: "20px", boxShadow: 3, overflow: "hidden",
                marginTop: 2,
            }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                รหัสการจอง
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                ผู้ใช้
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                สนาม
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                วันที่
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                เวลาเริ่ม
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                เวลาสิ้นสุด
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                เวลาที่ใช้ (ชั่วโมง)
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                จองเมื่อ
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold" }}>
                                จัดการ
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBookings.map((booking) => (
                            <TableRow key={booking.booking_id} hover>
                                <TableCell align="center">{booking.booking_id}</TableCell>
                                <TableCell align="center">{getUserName(booking.user_id)}</TableCell>
                                <TableCell align="center">{booking.field}</TableCell>
                                <TableCell align="center">{formatDateNoTime(booking.date)}</TableCell>
                                <TableCell align="center">{booking.startTime}</TableCell>
                                <TableCell align="center">{booking.endTime}</TableCell>
                                <TableCell align="center">{booking.timeUsed}</TableCell>
                                <TableCell align="center">{formatDate(booking.created_at)}</TableCell>
                                <TableCell align="center">
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleDelete(booking.booking_id)}
                                        sx={{ borderRadius: "20px" }}
                                    >
                                        ลบ
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default AdminBookings;
