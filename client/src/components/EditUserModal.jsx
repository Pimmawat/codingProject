import React, { useState } from 'react';
import {
  Button,
  Modal,
  Box,
  TextField,
  Typography,
} from '@mui/material';
import Swal from 'sweetalert2';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const EditUserModal = ({ open, onClose, user, onUpdate }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSubmit = async () => {
    try {
      await axios.put(`${apiUrl}/api/admin/users/${user.id}`, {
        name,
        email,
        phone,
      });
      onUpdate({ ...user, name, email, phone }); // อัปเดตข้อมูลใน state ของ React
      onClose(); // ปิด Modal
      Swal.fire('สำเร็จ!', 'อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว', 'success');
    } catch (error) {
      console.error('Error updating user:', error);
      Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถอัปเดตข้อมูลได้', 'error');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        component="form"
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
        <Typography
          variant="h6" mb={2}>
          แก้ไขข้อมูลผู้ใช้
        </Typography>
        <TextField
          required
          inputProps={{ style : {padding: '20px'}}}
          label="ชื่อ"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          required
          inputProps={{ style : {padding: '20px'}}}
          label="อีเมล"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}

        />

        <TextField
          required
          inputProps={{ style : {padding: '20px'}}}
          label="เบอร์โทร"
          fullWidth
          margin="normal"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}

        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth
          sx={{
            mt: 2,
            bgcolor: 'primary.main',
            ':hover': { bgcolor: 'primary.dark' },
          }}
        >
          บันทึก
        </Button>
      </Box>
    </Modal>
  );
};

export default EditUserModal;
