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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,

} from "@mui/material";
import Swal from "sweetalert2";
import './css/AdminBookings.css';
import Loading from "./Loading";
import EditBookingModal from "./EditBookingModal";

const apiUrl = import.meta.env.VITE_API_URL;

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [admin, setAdmin] = useState();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [slipUrl, setSlipUrl] = useState(null);
    const [openSlipModal, setOpenSlipModal] = useState(false);
    const navigate = useNavigate();


    const getUserName = (userId) => {
        const user = users.find((u) => u.id === userId);
        return user ? user.name : "ไม่พบชื่อ";
    };



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
                console.log(response.data);
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

    const filteredBookings = bookings.filter(
        (booking) =>
            (getUserName(booking.user_id) && getUserName(booking.user_id).toString().includes(searchQuery)) ||
            (booking.field && booking.field.toLowerCase().includes(searchQuery))
    );

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

    const handleEditBooking = (booking) => {
        setSelectedBooking(booking);
        setOpenModal(true);
    };

    const handleUpdateBooking = (updatedBooking) => {
        axios.put(`${apiUrl}/api/admin/bookings/${updatedBooking.booking_id}`, updatedBooking)
            .then((response) => {
                setBookings(bookings.map((booking) =>
                    booking.booking_id === updatedBooking.booking_id ? updatedBooking : booking
                ));
                Swal.fire("อัปเดตสำเร็จ!", "ข้อมูลการจองถูกอัปเดตแล้ว", "success");
                setOpenModal(false);
            })
            .catch((error) => {
                Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถอัปเดตข้อมูลการจองได้", "error");
                console.error("Error updating booking:", error);
            });
    };
    const viewSlip = async (slipUrl) => {
        if (slipUrl) {
            setSlipUrl(slipUrl);  // เก็บ URL ของสลีปที่ต้องการแสดง
            setOpenSlipModal(true);  // เปิด Modal เพื่อแสดงสลีป
        } else {
            Swal.fire("เกิดข้อผิดพลาด!", "ไม่พบ URL สำหรับสลีปนี้", "error");
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);  // ปิด Modal
    };
    return (
        <div className="admin-bookings-container-wrapper">
            <div className="admin-bookings-overlay"></div>
            <Container maxWidth="lg" sx={{ mt: 20 }}>
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
                        inputProps={{ style: { padding: '20px' } }}
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
                    borderRadius: "20px", boxShadow: 3,
                    marginTop: 2,
                }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>รหัสการจอง</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>ผู้ใช้</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>สนาม</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>วันที่</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>เวลาเริ่ม</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>เวลาสิ้นสุด</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>เวลาที่ใช้ (ชั่วโมง)</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>จองเมื่อ</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>จองโดย</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>จำนวน (บาท)</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>จัดการ</TableCell>
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
                                    <TableCell align="center">{booking.booking_by ?? "ไม่ระบุ"}</TableCell>
                                    <TableCell align="center">{booking.amount ?? "ไม่ระบุ"}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleEditBooking(booking)}
                                            sx={{ borderRadius: "20px", marginRight: 2 }}
                                        >
                                            แก้ไข
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleDelete(booking.booking_id)}
                                            sx={{ borderRadius: "20px" }}
                                        >
                                            ลบ
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="info"
                                            sx={{ borderRadius: "20px" }}
                                            onClick={() => viewSlip(booking.slip_url)}  // ใช้ booking.url
                                        >
                                            ดูสลีป
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {openModal && selectedBooking && (
                    <EditBookingModal
                        open={openModal}
                        onClose={() => setOpenModal(false)}
                        booking={selectedBooking}
                        onUpdate={handleUpdateBooking}
                    />
                )}

                <Dialog
                    open={openSlipModal}
                    onClose={() => setOpenSlipModal(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>สลีปการจอง</DialogTitle>
                    <DialogContent>
                        {slipUrl ? (
                            <img
                                src={`https://raw.githubusercontent.com/Pimmawat/codingProject/refs/heads/main/server/${slipUrl}`}
                                alt="Slip"
                                style={{ width: "100%", height: "auto" }}
                            />) : (
                            <div>กำลังโหลดรูปภาพ...</div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setOpenSlipModal(false)}
                            color="primary"
                        >
                            ปิด
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );
};

export default AdminBookings;
