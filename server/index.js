const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const paymentRoute = require('./payment');
const multer = require('multer');
const FormData = require('form-data');
const axios = require("axios");
const dayjs = require("dayjs");
const isBetween = require('dayjs/plugin/isBetween');
const verifyAdmin = require('./middlewares/verifyAdmin');
const nodemailer = require('nodemailer');
dayjs.extend(isBetween);

const JWT_SECRET = 'hellohackerman';

const upload = multer({ storage: multer.memoryStorage() });
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'cpearena@gmail.com',
      pass: 'ceem yoyn ilrp qsik', // ใช้ App Password
    },
  });

  try {
    await transporter.sendMail({
      from: '"CPE Arena" <cpearena@gmail.com>',
      to: email,
      subject: 'OTP ยืนยันตัวตน',
      text: `รหัส OTP ของคุณคือ ${otp} จะหมดอายุใน 10 นาที`,
    });
    console.log('ส่ง OTP สำเร็จ');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการส่ง OTP:', error.message);
    throw error;
  }
};

app.post('/api/bookings', (req, res) => {
  const { id, field, date, startTime, endTime, timeUsed } = req.body;
  console.log(id, field, date, startTime, endTime, timeUsed);

  const checkQuery = `
    SELECT * FROM reserve WHERE field = ? AND date = ? AND (startTime < ? AND endTime > ?)
  `;
  db.query(checkQuery, [field, date, endTime, startTime], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length > 0) {
      return res.status(400).send({ message: 'เวลานี้ถูกจองแล้ว' });
    }

    const query = `
      INSERT INTO reserve (user_id, field, date, startTime, endTime, timeUsed) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [id, field, date, startTime, endTime, timeUsed], (err, result) => {
      if (err) return res.status(500).send(err);

      // คำนวณแต้มจากจำนวนชั่วโมง
      const points = timeUsed * 10; // 10 แต้มต่อชั่วโมง

      const pointsQuery = `
        INSERT INTO points (user_id, booking_id, points) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE points = points + VALUES(points)
      `;
      db.query(pointsQuery, [id, result.insertId, points], (err) => {
        if (err) return res.status(500).send(err);
        res.status(201).send({ message: 'จองสำเร็จ', bookingId: result.insertId });
      });
    });
  });
});

app.get('/api/bookings', (req, res) => {
  const sql = 'SELECT * FROM reserve';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      res.status(500).send('Error fetching bookings');
    } else {
      if (Array.isArray(results)) {
        res.json(results);
      } else {
        res.json([]);
      }
    }
  });
});

// เส้นทางลงทะเบียน
app.post('/api/member/register', (req, res) => {
  const { name, phone, email, password } = req.body;

  if (!name || !phone || !email || !password) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const checkQuery = 'SELECT * FROM users WHERE phone = ? OR email = ?';
  db.query(checkQuery, [phone, email], (err, results) => {
    if (err) return res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });

    if (results.length > 0) {
      return res.status(400).json({ message: 'เบอร์โทรหรืออีเมลถูกใช้แล้ว' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // สุ่ม OTP 6 หลัก
    const otpExpiry = new Date(Date.now() + 10 * 60000); // OTP หมดอายุใน 10 นาที

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน' });

      const insertQuery = `
        INSERT INTO users (name, phone, email, password, otp, otp_expiry, is_verified) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(insertQuery, [name, phone, email, hash, otp, otpExpiry, false], async (err) => {
        if (err) return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน' });

        try {
          await sendOTP(email, otp);
          res.status(201).json({ message: 'กรุณายืนยัน OTP ในอีเมลของคุณ' });
        } catch (emailError) {
          res.status(500).json({ message: 'ไม่สามารถส่ง OTP ได้', error: emailError.message });
        }
      });
    });
  });
});

app.post('/api/member/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  console.log('Received data:', req.body);

  if (!phone || !otp) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const query = 'SELECT * FROM users WHERE phone = ? AND otp = ?';
  db.query(query, [phone, otp], (err, results) => {
    if (err) return res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });

    if (results.length === 0) {
      return res.status(400).json({ message: 'OTP ไม่ถูกต้องหรือหมดอายุ' });
    }

    const user = results[0];
    const currentTime = new Date();
    const otpExpiry = new Date(user.otp_expiry);
    if (currentTime > otpExpiry) {
      const deleteQuery = 'DELETE FROM users WHERE phone = ?';
      db.query(deleteQuery, [phone], (err) => {
        if (err) return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
        return res.status(400).json({ message: 'OTP หมดอายุ และข้อมูลถูกลบแล้ว' });
      });
    } else {
      const updateQuery = `
        UPDATE users 
        SET is_verified = TRUE, otp = NULL, otp_expiry = NULL 
        WHERE phone = ?
      `;
      db.query(updateQuery, [phone], (err) => {
        if (err) return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยืนยัน' });
        res.status(200).json({ message: 'ยืนยันตัวตนสำเร็จ' });
      });
    }
  });
});

app.post('/api/member/check-otp-expiry', (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'กรุณากรอกเบอร์โทร' });
  }

  const query = 'SELECT otp, otp_expiry FROM users WHERE phone = ?';
  db.query(query, [phone], (err, results) => {
    if (err) return res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });

    if (results.length === 0) {
      return res.status(400).json({ message: 'ไม่พบข้อมูลของผู้ใช้นี้' });
    }

    const user = results[0];
    const currentTime = new Date();
    const otpExpiry = new Date(user.otp_expiry);

    if (currentTime > otpExpiry) {
      const deleteQuery = 'DELETE FROM users WHERE phone = ?';
      db.query(deleteQuery, [phone], (err) => {
        if (err) return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });

        return res.status(400).json({ message: 'OTP หมดอายุและข้อมูลถูกลบแล้ว' });
      });
    } else {
      return res.status(200).json({ message: 'OTP ยังไม่หมดอายุ' });
    }
  });
});


app.post('/api/member/login', (req, res) => {
  const { phone, password } = req.body;

  const query = 'SELECT * FROM users WHERE phone = ?';
  db.query(query, [phone], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }
    // ตรวจรหัสผ่าน
    const user = result[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid phone or password' });
      }
      const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ message: 'Login successful', id: user.id, name: user.name, phone: user.phone, point: user.total_points, token });
    });
  });
});

app.use('/api/payment', paymentRoute);

app.post('/api/payment/upload-slip', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'กรุณาอัปโหลดไฟล์สลิป' });
    }
    const { amount } = req.body;
    const branchId = "30828";
    const apiKey = "SLIPOKE0E8CPS";

    const form = new FormData();
    form.append('files', req.file.buffer, { filename: req.file.originalname });
    form.append('amount', amount);
    //form.append('log', 'true');

    const response = await axios.post(
      `https://api.slipok.com/api/line/apikey/${branchId}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          "x-authorization": apiKey,
        },
      }
    );

    const slipData = response.data.data;
    console.log(slipData);

    res.status(200).json({ message: 'อัปโหลดสลิปสำเร็จ', slipData });
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err) && err.response) {
      const statusCode = err.response.status;
      const errorMessage = err.response.data?.message || 'เกิดข้อผิดพลาด';
      console.log(`Error ${statusCode}: ${errorMessage}`);
      return res.status(statusCode).json({ message: errorMessage });
    }
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปโหลดสลิป' });
  }
});

app.get('/api/tickets', (req, res) => {
  const sql = 'SELECT * FROM reserve WHERE user_id = ?';
  const user_id = req.query.user_id;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      res.status(500).send('Error fetching bookings');
    } else {
      if (Array.isArray(results)) {
        res.json(results);
      } else {
        res.json([]);
      }
    }
  });
});

app.get('/api/points', (req, res) => {
  const sql = 'SELECT * FROM points WHERE user_id = ?';
  const user_id = req.query.user_id;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      res.status(500).send('Error fetching bookings');
    } else {
      if (Array.isArray(results)) {
        res.json(results);
      } else {
        res.json([]);
      }
    }
  });
});

app.post("/api/verify-qrcode", async (req, res) => {

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  try {
    const qrData = req.body;
    console.log(qrData);

    if (qrData.secretCode != "H3110man") {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }

    // ตรวจสอบรูปแบบข้อมูลใน QR Code
    if (!qrData.date || !qrData.startTime || !qrData.endTime) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR Code format",
      });
    }

    const { date, startTime, endTime } = qrData;

    // แปลงเวลาให้อยู่ในรูปแบบ 24 ชั่วโมง
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);

    // ตรวจสอบรูปแบบวันที่และเวลา
    const bookingStartDateTime = dayjs(`${date} ${formattedStartTime}`);
    const bookingEndDateTime = dayjs(`${date} ${formattedEndTime}`);

    if (!bookingStartDateTime.isValid() || !bookingEndDateTime.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid date or time format",
      });
    }
    // ตรวจสอบช่วงเวลาการจอง
    const currentDateTime = dayjs();
    if (currentDateTime.isBefore(bookingStartDateTime) || currentDateTime.isAfter(bookingEndDateTime)) {
      return res.status(400).json({
        success: false,
        message: "The booking is not valid at this time",
      });
    }
    // ถ้าข้อมูลทั้งหมดถูกต้อง
    return res.status(200).json({
      success: true,
      message: "QR Code is valid",
    });
  } catch (error) {
    console.error("Error verifying QR Code:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.get('/api/points', (req, res) => {
  const { user_id } = req.query;
  console.log('Received user_id:', user_id); // ตรวจสอบค่า user_id ใน console

  const query = `SELECT SUM(points) AS totalPoints FROM points WHERE user_id = ?`;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching points:', err);
      return res.status(500).send({ message: 'Server error' });
    }

    const totalPoints = results[0]?.totalPoints || 0; // ถ้าไม่มีแต้ม ให้แสดง 0
    console.log(totalPoints);
    res.status(200).send({ totalPoints });
  });
});

//Admin

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM admins WHERE username = ?';
  db.query(query, [username], (err, result) => {
    if (result.length === 0) {
      return res.status(404).json({ message: 'Admin ไม่พบ' });
    }
    const admin = result[0];
    // ตรวจสอบรหัสผ่าน
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid phone or password' });
      }
      const token = jwt.sign({ id: admin.id, role: admin.name }, JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ message: 'Login successful', id: admin.id, name: admin.name, phone: admin.phone, point: admin.total_points, token });
    });
  });
});

app.get('/admin/dashboard', verifyAdmin, (req, res) => {
  res.json({ message: 'ยินดีต้อนรับสู่ Admin Dashboard' });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
