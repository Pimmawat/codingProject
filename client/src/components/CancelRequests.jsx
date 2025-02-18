import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Button, Table, TableBody, TableContainer, TableCell, TableHead, TableRow,
    Dialog, DialogActions, DialogContent, DialogTitle, Box, Grid, Typography,
    Paper, CircularProgress
} from '@mui/material';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

const CancelRequests = () => {
    const [requests, setRequests] = useState([]);
    const [admin, setAdmin] = useState(null);
    const [users, setUsers] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
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
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่มี Token โปรดลองอีกครั้ง',
            }).then(() => navigate('/'));
        }

        axios.get(`${apiUrl}/api/admin/users`)
            .then((response) => setUsers(response.data))
            .catch((error) => console.error("Error fetching users:", error));

        fetchCancelRequests();
    }, [navigate]);

    const fetchCancelRequests = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/cancel-requests`);
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching cancel requests:', error);
        }
    };

    const fetchBookingDetails = async (request) => {
        try {
            const response = await axios.get(`${apiUrl}/api/admin/bookings/${request.booking_id}`);
            if (response.data && response.data.length > 0) {
                setBookingDetails(response.data[0]);
                setSelectedRequest(request);
                setOpenModal(true);
            } else {
                Swal.fire('ไม่พบข้อมูลการจอง', 'ไม่พบข้อมูลการจองที่ตรงกับ Booking ID', 'error');
            }
        } catch (error) {
            console.error('Error fetching booking details:', error);
            Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลการจองได้', 'error');
        }
    };

    const handleApprove = (booking_id) => {
        setOpenModal(false);
        Swal.fire({
            title: "คุณต้องการลบการจองนี้หรือไม่?",
            text: "ข้อมูลที่ลบแล้วจะไม่สามารถกู้คืนได้!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ใช่, ลบเลย!",
            cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`${apiUrl}/api/admin/bookings/${booking_id}`)
                    .then(() => {
                        setRequests(requests.filter((request) => request.booking_id !== booking_id));
                        Swal.fire("ลบสำเร็จ!", "การจองถูกลบเรียบร้อยแล้ว", "success");
                    })
                    .catch((error) => {
                        Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลบการจองได้", "error");
                        console.error("Error deleting booking:", error);
                    });
            }
        });
    };

    return (
        <Box sx={{ padding: 3, marginTop: { xs: '100px', md: '120px' } }}>
            <Typography variant="h4" gutterBottom align="center" color="primary">
                คำขอยกเลิก
            </Typography>
            <Grid container justifyContent="center">
                <Grid item xs={12} sm={10} md={8}>
                    <Paper elevation={3} sx={{ padding: 2, borderRadius: 3 }}>
                        <TableContainer sx={{ overflowX: "auto" }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Booking ID</TableCell>
                                        <TableCell>เหตุผล</TableCell>
                                        <TableCell>สถานะ</TableCell>
                                        <TableCell>การจัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {requests.length > 0 ? (
                                        requests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell>{request.booking_id}</TableCell>
                                                <TableCell>{request.reason}</TableCell>
                                                <TableCell>{request.status}</TableCell>
                                                <TableCell>
                                                    {request.status === 'pending' && (
                                                        <Button variant="contained" color="primary" onClick={() => fetchBookingDetails(request)}>
                                                            ดูข้อมูล
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">ไม่มีคำขอยกเลิก</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Modal for Booking Details */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle align="center">รายละเอียดการจอง</DialogTitle>
                <DialogContent dividers>
                    {bookingDetails ? (
                        <TableContainer >
                            <Typography align="center" sx={{ mb: 2, color: "red", fontWeight: "bold" }}>
                                * กรุณาโอนเงินคืนก่อนกดอนุมัติ เนื่องจากข้อมูลจะถูกลบอัตโนมัติ *
                            </Typography>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell><strong>Booking ID:</strong></TableCell>
                                        <TableCell>{bookingDetails.booking_id}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>ชื่อผู้จอง:</strong></TableCell>
                                        <TableCell>{getUserName(bookingDetails.user_id)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>วันที่:</strong></TableCell>
                                        <TableCell>{bookingDetails.date}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>เวลาเริ่ม:</strong></TableCell>
                                        <TableCell>{bookingDetails.startTime}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>เวลาสิ้นสุด:</strong></TableCell>
                                        <TableCell>{bookingDetails.endTime}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>เวลาที่ใช้:</strong></TableCell>
                                        <TableCell>{bookingDetails.timeUsed}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>สนามที่:</strong></TableCell>
                                        <TableCell>{bookingDetails.field}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell><strong>จำนวนเงิน:</strong></TableCell>
                                        <TableCell>{bookingDetails.amount !== null && bookingDetails.amount !== undefined ? bookingDetails.amount : "ไม่ระบุ"}</TableCell>
                                    </TableRow>
                                    {selectedRequest && (
                                        <>
                                            <TableRow>
                                                <TableCell><strong>พร้อมเพย์:</strong></TableCell>
                                                <TableCell>{selectedRequest.promptpay}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell><strong>เหตุผล:</strong></TableCell>
                                                <TableCell>{selectedRequest.reason}</TableCell>
                                            </TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height={100}>
                            <CircularProgress />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
                    <Button variant="contained" color="primary" onClick={() => handleApprove(bookingDetails.booking_id)}>อนุมัติ</Button>
                    <Button variant="outlined" onClick={() => setOpenModal(false)}>ปิด</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CancelRequests;
