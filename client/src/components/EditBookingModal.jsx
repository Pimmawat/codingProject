import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import Swal from "sweetalert2";

const EditBookingModal = ({ open, onClose, booking, onUpdate, bookings }) => {
    const [startTime, setStartTime] = useState(booking?.startTime || "");
    const [endTime, setEndTime] = useState(booking?.endTime || "");
    const [timeUsed, setTimeUsed] = useState(booking?.timeUsed || "");
    const [selectedField, setSelectedField] = useState(booking?.field || "สนาม 1");

    const isTimeValid = () => {
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        const diffInMinutes = (end - start) / (1000 * 60);
    
        if (diffInMinutes > timeUsed * 60) {
            Swal.fire({
                icon: "error",
                title: "ไม่สามารถเลือกเวลาเกิน",
                text: `ไม่สามารถเลือกเวลาเกิน ${timeUsed} ชั่วโมงได้`,
            });
            onClose();
            return false;
        }
        return true;
    };
    // ฟังก์ชันบันทึกข้อมูลการจอง
    const handleSubmit = () => {
        // สร้างข้อมูล JSON ที่ต้องการส่ง
        if (!isTimeValid()) {
            return;
        }
        const bookingData = {
            booking_id: booking?.booking_id,
            field: selectedField,
            startTime,
            endTime,
            date: booking?.date || "",
            timeUsed, 
        };
        // ส่งข้อมูล JSON ไปที่ onUpdate
        onUpdate(bookingData);
        // ปิด Modal หลังจากบันทึก
        onClose();

    };

    // เมื่อเปิด Modal จะตั้งค่าเริ่มต้นของเวลา
    useEffect(() => {
        if (booking) {
            setStartTime(booking.startTime);
            setEndTime(booking.endTime);
            setTimeUsed(booking.timeUsed);
            setSelectedField(booking.field);
        }
    }, [booking]);

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    minWidth: 400,
                }}
            >
                <Typography variant="h6" mb={2}>
                    แก้ไขการจอง
                </Typography>
                {/* Dropdown สำหรับเลือกสนาม */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>สนาม</InputLabel>
                    <Select
                        value={selectedField}
                        onChange={(e) => setSelectedField(e.target.value)}
                        label="สนาม"
                    >
                        <MenuItem value="สนาม 1">สนาม 1</MenuItem>
                        <MenuItem value="สนาม 2">สนาม 2</MenuItem>
                        <MenuItem value="สนาม 3">สนาม 3</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="วันที่"
                    type="date"
                    fullWidth
                    margin="normal"
                    value={booking?.date || ""}
                    onChange={(e) =>
                        onUpdate({ ...booking, date: e.target.value })
                    }
                />
                <TextField
                    label="เวลาเริ่ม"
                    type="time"
                    fullWidth
                    margin="normal"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
                <TextField
                    label="เวลาสิ้นสุด"
                    type="time"
                    fullWidth
                    margin="normal"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
                <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        sx={{ marginRight: "8px" }}
                    >
                        บันทึก
                    </Button>
                    <Button variant="outlined" onClick={onClose}>
                        ยกเลิก
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditBookingModal;
