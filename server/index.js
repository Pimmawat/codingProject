const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const paymentRoute = require('./payment');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const FormData = require('form-data');
const axios = require("axios");
const dayjs = require("dayjs");
const isBetween = require('dayjs/plugin/isBetween');
const nodemailer = require('nodemailer');
dayjs.extend(isBetween);
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
require('dotenv').config();

const JWT_SECRET = 'hellohackerman';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

const app = express();

app.use(cors({
  origin: '*',
  methods: ['*'],
  credentials: true,
}));
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
      pass: 'kpyv ngvm xttm koma', // ใช้ App Password
    },
  });

  try {
    await transporter.sendMail({
      from: '"CPE Arena" <cpearena@gmail.com>',
      to: email,
      subject: '🔐 OTP ยืนยันตัวตนสำหรับเข้าสู่ระบบ',
      text: `
    สวัสดี,
    
    ยินดีต้อนรับสู่ระบบจองสนาม CPE Arena
    
    🔹 รหัส OTP ของคุณคือ: ${otp}
    🔹 รหัสนี้มีอายุ 10 นาที กรุณาใช้ก่อนหมดอายุ
    
    หากคุณไม่ได้ร้องขอรหัสนี้ โปรดเพิกเฉยต่ออีเมลนี้
    
    ขอบคุณที่ใช้บริการ
    CPE Arena`,
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="
      font-family: 'Helvetica Neue', Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
      color: #1f2937;"
    >
      <div style="
        background-color: white;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);"
      >
        <img 
          src="https://res.cloudinary.com/dkvap9luq/image/upload/v1739909584/CPE_h9zel7.png" 
          alt="CPE Arena Logo" 
          style="display: block; margin: 0 auto 24px; max-width: 150px;"
          readonly
        >
        
        <h1 style="
          color: #111827;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;"
        >
          ยินดีต้อนรับสู่ระบบจองสนาม CPE Arena
        </h1>
    
        <div style="
          background-color: #f3f4f6;
          border-radius: 6px;
          padding: 16px;
          margin: 24px 0;
          text-align: center;"
        >
          <p style="margin: 0 0 8px; font-size: 16px;">รหัส OTP ของคุณคือ</p>
          <div style="
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 4px;
            color: #2563eb;"
          >
            ${otp}
          </div>
          <p style="
            margin: 8px 0 0;
            font-size: 14px;
            color: #6b7280;"
          >
            รหัสนี้มีอายุ 10 นาที กรุณาใช้ก่อนหมดอายุ
          </p>
        </div>
    
        <p style="
          color: #6b7280;
          font-size: 14px;
          text-align: center;
          margin: 24px 0;"
        >
          หากคุณไม่ได้ร้องขอรหัสนี้ โปรดเพิกเฉยต่ออีเมลนี้
        </p>
    
        <div style="
          border-top: 1px solid #e5e7eb;
          margin-top: 24px;
          padding-top: 24px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;"
        >
          <p style="margin: 0;">ขอบคุณที่ใช้บริการ</p>
          <p style="margin: 4px 0 0; font-weight: 600;">CPE Arena</p>
        </div>
      </div>
    </body>
    </html>`
    });
    console.log('ส่ง OTP สำเร็จ');
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการส่ง OTP:', error.message);
    throw error;
  }
};

const sendResetEmail = (email, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'cpearena@gmail.com',
      pass: 'kpyv ngvm xttm koma',
    },
  });

  const mailOptions = {
    from: '"CPE Arena" <cpearena@gmail.com>',
    to: email,
    subject: '🔑 รีเซ็ตรหัสผ่านของคุณ',
    text: `
  สวัสดี,
  
  คุณได้ร้องขอการรีเซ็ตรหัสผ่านสำหรับบัญชี CPE Arena ของคุณ
  กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:
  
  ${resetLink}
  
  หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่าน โปรดเพิกเฉยต่ออีเมลนี้
  
  ขอบคุณที่ใช้บริการ
  CPE Arena`,
    html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="
    font-family: 'Helvetica Neue', Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9fafb;
    color: #1f2937;"
  >
    <div style="
      background-color: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);"
    >
      <img 
        src="https://res.cloudinary.com/dkvap9luq/image/upload/v1739909584/CPE_h9zel7.png" 
        alt="CPE Arena Logo" 
        style="display: block; margin: 0 auto 24px; max-width: 150px;"
        readonly
      >
      
      <h1 style="
        color: #111827;
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 16px;
        text-align: center;"
      >
        รีเซ็ตรหัสผ่านของคุณ
      </h1>
  
      <p style="
        color: #4b5563;
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 24px;
        text-align: center;"
      >
        คุณได้ร้องขอการรีเซ็ตรหัสผ่านสำหรับบัญชี CPE Arena ของคุณ<br>
        กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
      </p>
  
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" 
          style="
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            display: inline-block;
            text-align: center;
            transition: background-color 0.2s;"
        >
          รีเซ็ตรหัสผ่าน
        </a>
      </div>
  
      <p style="
        color: #6b7280;
        font-size: 14px;
        margin: 24px 0;
        text-align: center;"
      >
        หากปุ่มด้านบนไม่ทำงาน คุณสามารถคัดลอกและวางลิงก์ด้านล่างในเบราว์เซอร์ของคุณ:<br>
        <a href="${resetLink}" 
          style="
            color: #2563eb;
            word-break: break-all;
            font-size: 12px;"
        >
          ${resetLink}
        </a>
      </p>
  
      <p style="
        color: #6b7280;
        font-size: 14px;
        text-align: center;
        margin: 24px 0;"
      >
        หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่าน โปรดเพิกเฉยต่ออีเมลนี้
      </p>
  
      <div style="
        border-top: 1px solid #e5e7eb;
        margin-top: 24px;
        padding-top: 24px;
        text-align: center;
        color: #6b7280;
        font-size: 14px;"
      >
        <p style="margin: 0;">ขอบคุณที่ใช้บริการ</p>
        <p style="margin: 4px 0 0; font-weight: 600;">CPE Arena</p>
      </div>
    </div>
  </body>
  </html>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cpearena@gmail.com',
    pass: 'kpyv ngvm xttm koma',
  },
});

app.post('/api/auth/resetpass', (req, res) => {
  const { email } = req.body;

  // ใช้ callback ในการ query
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) {
      console.error('Error in database query:', err);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });
    }

    // สร้าง JWT Token สำหรับรีเซ็ตรหัสผ่าน
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });

    // สร้างลิงก์รีเซ็ตรหัสผ่าน
    const resetLink = `https://cpearena.vercel.app/reset-password?token=${token}`;

    // ส่งอีเมล
    transporter.sendMail({
      from: '"รีเซ็ตรหัสผ่าน" <cpearena@gmail.com>',
      to: email,
      subject: 'ลิงก์รีเซ็ตรหัสผ่าน',
      text: `คุณสามารถรีเซ็ตรหัสผ่านได้ที่ลิงก์นี้: ${resetLink}`,
      html: `<p>คุณสามารถรีเซ็ตรหัสผ่านได้ที่ลิงก์นี้: <a href="${resetLink}">${resetLink}</a></p>`,
    }, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ message: 'ไม่สามารถส่งอีเมลได้' });
      }

      // ตอบกลับสำเร็จ
      res.json({ message: 'ลิงก์รีเซ็ตรหัสผ่านได้ถูกส่งไปยังอีเมลของคุณแล้ว' });
    });
  });
});

app.post('/api/auth/update-password', (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // ตรวจสอบ JWT Token
    const decoded = jwt.verify(token, JWT_SECRET);

    // แฮชรหัสผ่านใหม่
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแฮชรหัสผ่าน' });
      }

      // อัปเดตข้อมูลในฐานข้อมูล
      db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, decoded.email], (err, result) => {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตรหัสผ่าน' });
        }

        // ตรวจสอบว่ามีข้อมูลที่ได้รับการอัปเดต
        if (result.affectedRows === 0) {
          return res.status(400).json({ message: 'ไม่สามารถอัปเดตรหัสผ่านได้' });
        }

        // ส่งข้อความสำเร็จ
        res.json({ message: 'รีเซ็ตรหัสผ่านสำเร็จแล้ว' });
      });
    });
  } catch (err) {
    console.error('Error in token verification:', err);
    res.status(400).json({ message: 'ลิงก์รีเซ็ตรหัสผ่านหมดอายุหรือไม่ถูกต้อง' });
  }
});


app.get('/', (req, res) => {
  res.send("THis is API CpeArena");
});

app.post('/api/cancel-request', (req, res) => {
  const { booking_id, reason, promptpay } = req.body;
  if (!booking_id || !reason || !promptpay) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }
  console.log(booking_id, reason, promptpay);
  try {
    db.query(
      'INSERT INTO cancel_requests (booking_id, reason, promptpay, status) VALUES (?, ?, ?, ?)',
      [booking_id, reason, promptpay, 'pending']
    );
    res.status(200).json({ message: 'ส่งคำขอยกเลิกสำเร็จ' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

app.get('/api/cancel-requests', (req, res) => {
  const sql = 'SELECT * FROM cancel_requests';
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

app.put('/api/cancel-requests/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('UPDATE cancel_requests SET status = ? WHERE id = ?', ['approved', id]);
    res.status(200).json({ message: 'อนุมัติคำขอยกเลิกสำเร็จ' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

app.post('/api/bookings', (req, res) => {
  const { id, field, date, startTime, endTime, timeUsed, slip_url, amount } = req.body;
  console.log(id, field, date, startTime, endTime, timeUsed, slip_url, amount);

  const checkQuery = `
    SELECT * FROM reserve WHERE field = ? AND date = ? AND (startTime < ? AND endTime > ?)
  `;
  db.query(checkQuery, [field, date, endTime, startTime], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length > 0) {
      return res.status(400).send({ message: 'เวลานี้ถูกจองแล้ว' });
    }

    const query = `
      INSERT INTO reserve (user_id, field, date, startTime, endTime, timeUsed, booking_by, slip_url, amount) 
      VALUES (?, ?, ?, ?, ?, ? , ?, ? ,?)
    `;
    db.query(query, [id, field, date, startTime, endTime, timeUsed, "Cash", slip_url, amount], (err, result) => {
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

app.post('/api/redeem/bookings', (req, res) => {
  const { id, field, date, startTime, endTime, timeUsed } = req.body;

  // ตรวจสอบว่าผู้ใช้งานมีแต้มเพียงพอหรือไม่
  const checkPointsQuery = `SELECT SUM(points) AS totalPoints FROM points WHERE user_id = ?`;
  db.query(checkPointsQuery, [id], (err, results) => {
    if (err) return res.status(500).send(err);

    const totalPoints = results[0]?.totalPoints || 0; // ถ้าไม่มีข้อมูล กำหนดให้เป็น 0
    const requiredPoints = timeUsed * 100; // แต้มที่ต้องใช้

    if (totalPoints < requiredPoints) {
      return res.status(400).send({
        message: `แต้มของคุณไม่เพียงพอ (${totalPoints} แต้ม) ต้องการ ${requiredPoints} แต้ม`
      });
    }
    // ตรวจสอบว่ามีการจองในเวลานี้หรือไม่
    const checkQuery = `
      SELECT * FROM reserve 
      WHERE field = ? AND date = ? AND (startTime < ? AND endTime > ?)
    `;
    db.query(checkQuery, [field, date, endTime, startTime], (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length > 0) {
        return res.status(400).send({ message: 'เวลานี้ถูกจองแล้ว' });
      }

      // เพิ่มข้อมูลการจอง
      const query = `
        INSERT INTO reserve (user_id, field, date, startTime, endTime, timeUsed, booking_by, amount) 
        VALUES (?, ?, ?, ?, ?, ?, ? , ?)
      `;
      db.query(query, [id, field, date, startTime, endTime, timeUsed, "points", "ใช้แต้มแลก"], (err, result) => {
        if (err) return res.status(500).send(err);
        // หักแต้มจากผู้ใช้งาน
        const points = timeUsed * -100;
        const pointsQuery = `
          INSERT INTO points (user_id, booking_id, points) 
          VALUES (?, ?, ?) 
        `;
        db.query(pointsQuery, [id, result.insertId, points], (err) => {
          if (err) return res.status(500).send(err);
          res.status(201).send({
            message: 'จองสำเร็จ',
            bookingId: result.insertId
          });
        });
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
      return res.status(400).json({ message: 'OTP ไม่ถูกต้อง' });
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
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // ตรวจรหัสผ่าน
    const user = result[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({ message: 'Login successful', id: user.id, name: user.name, email: user.email, point: user.total_points, token });
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
    const branchId = process.env.BRANCH_ID;
    const apiKey = process.env.API_KEY;

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream({ folder: 'slip_uploads' }, (error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const cloudinaryResult = await streamUpload(req.file.buffer);
    const imageUrl = cloudinaryResult.secure_url;
    console.log("✅ อัปโหลดสลิปสำเร็จ:", imageUrl);

    const form = new FormData();
    form.append('url', imageUrl);
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
    console.log(slipData, imageUrl);
    res.status(200).json({ message: 'อัปโหลดสลิปสำเร็จ', slipData, imageUrl });
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

app.get('/api/profile:id', (req, res) => {
  const sql = 'SELECT * FROM users WHERE id = ?';
  const userId = req.params.id; // ดึง id จาก params

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching profile:', err);
      res.status(500).send('Error fetching profile');
    } else {
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).send('Profile not found');
      }
    }
  });
});

app.put('/api/profile/:id', (req, res) => {
  const { name, email, phone } = req.body;
  const userId = req.params.id;
  // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วนหรือไม่
  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }
  // ตรวจสอบว่าเบอร์โทรที่กรอกมีอยู่ในระบบแล้วหรือไม่
  const checkPhoneSql = 'SELECT * FROM users WHERE phone = ? AND id != ?';
  db.query(checkPhoneSql, [phone, userId], (err, results) => {
    if (err) {
      console.error('Error checking phone:', err);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบเบอร์โทร' });
    }
    // ถ้ามีเบอร์โทรซ้ำ ให้ส่งข้อผิดพลาด
    if (results.length > 0) {
      return res.status(400).json({ message: 'เบอร์โทรนี้ถูกใช้งานแล้ว' });
    }
    // อัปเดตข้อมูลผู้ใช้
    const sql = 'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?';
    db.query(sql, [name, email, phone, userId], (err, result) => {
      if (err) {
        console.error('Error updating profile:', err);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
      }
      res.json({ message: 'ข้อมูลอัปเดตสำเร็จ' });
    });
  });
});

app.post('/api/auth/forgetpassword', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'กรุณาใส่อีเมล' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });
    }

    // สร้างโทเค็นสำหรับรีเซ็ตรหัสผ่าน
    const user = results[0];
    const token = jwt.sign({ email: user.email }, 'hellohackerman', { expiresIn: '1h' });
    const resetLink = `https://cpearena.vercel.app/resetpassword/${token}`;

    // ส่งอีเมล
    sendResetEmail(user.email, resetLink);

    res.json({ message: 'ลิงก์รีเซ็ตรหัสผ่านได้ถูกส่งไปยังอีเมลของคุณแล้ว' });
  });
});

app.post('/api/auth/resetpassword', (req, res) => {
  const { password, resetToken } = req.body;

  // ตรวจสอบว่ามี token หรือไม่
  if (!resetToken || !password) {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
  }

  // ตรวจสอบว่า token ถูกต้องและดึงข้อมูลจาก token
  jwt.verify(resetToken, 'hellohackerman', (err, decoded) => {
    if (err) {
      return res.status(400).json({ message: 'ลิงก์รีเซ็ทหมดอายุหรือไม่ถูกต้อง' });
    }

    // ดึงอีเมลจาก token
    const email = decoded.email;

    const checkQuery = 'SELECT * FROM used_tokens WHERE token = ?';
    db.query(checkQuery, [resetToken], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบ token' });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'ลิงก์นี้ถูกใช้ไปแล้ว' });
      }
      // เข้ารหัสรหัสผ่านใหม่
      const hashedPassword = bcrypt.hashSync(password, 10);

      // อัปเดตข้อมูลรหัสผ่านในฐานข้อมูล
      const query = 'UPDATE users SET password = ? WHERE email = ?';
      db.query(query, [hashedPassword, email], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'ไม่สามารถอัปเดตข้อมูลได้' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่ต้องการรีเซ็ตรหัสผ่าน' });
        }
        const insertQuery = 'INSERT INTO used_tokens (token) VALUES (?)';
        db.query(insertQuery, [resetToken], (err, insertResult) => {
          if (err) {
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึก token' });
          }
          res.status(200).json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ' });
        });
      });
    });
  });
});
//Admin

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  // ตรวจสอบว่ามีข้อมูลหรือไม่
  if (!username || !password) {
    return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  // ค้นหาข้อมูลแอดมินในฐานข้อมูล
  const sql = 'SELECT * FROM admins WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'อีเมลไม่ถูกต้อง' });
    }

    const admin = results[0];

    // ตรวจสอบรหัสผ่านที่กรอกกับรหัสผ่านที่เก็บในฐานข้อมูล
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing password:', err);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
      }

      // สร้าง JWT Token
      const token = jwt.sign({ id: admin.id, role: 'admin' }, 'gupenadmin', { expiresIn: '1h' });

      res.json({
        message: 'เข้าสู่ระบบสำเร็จ',
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          username: admin.username,
          role: admin.role,
        },
      });
    });
  });
});

app.get('/api/users/count', (req, res) => {
  db.query('SELECT COUNT(*) AS count FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json({ count: results[0].count });
  });
});

app.get('/api/reserves/count', (req, res) => {
  db.query('SELECT COUNT(*) AS count FROM reserve', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json({ count: results[0].count });
  });
});

app.get('/api/cancel/count', (req, res) => {
  db.query('SELECT COUNT(*) AS count FROM cancel_requests', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json({ count: results[0].count });
  });
});

app.get('/api/admin/users', (req, res) => {
  const sql = 'SELECT * FROM users';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).send('Error fetching users');
    } else {
      if (Array.isArray(results)) {
        res.json(results);
      } else {
        res.json([]);
      }
    }
  });
});

app.delete('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error to delete users:', err);
      return res.status(500).send('Error delete users'); // ถ้ามีข้อผิดพลาด ส่งคำตอบก่อน
    }
    return res.status(200).send('User deleted successfully');
  });
});

app.get('/api/admin/bookings', async (req, res) => {
  const sql = 'SELECT * FROM reserve ORDER BY date DESC';

  try {
    const [results] = await db.promise().query(sql);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง' });
  }
});

app.get('/api/admin/bookings/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM reserve WHERE booking_id = ?';

  try {
    const [results] = await db.promise().query(sql, [id]);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง' });
  }
});

app.delete('/api/admin/bookings/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM reserve WHERE booking_id = ?';

  try {
    const [results] = await db.promise().query(sql, [id]);
    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'ไม่พบข้อมูลการจองที่ต้องการลบ' });
    } else {
      res.status(200).json({ message: 'ลบข้อมูลการจองสำเร็จ' });
    }
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูลการจอง' });
  }
});

app.put('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  db.query(
    'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
    [name, email, phone, id],
    (error, results) => {
      if (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'ไม่พบผู้ใช้งานที่ต้องการแก้ไข' });
      }

      res.json({ message: 'อัปเดตข้อมูลสำเร็จ' });
    }
  );
});

app.put("/api/admin/bookings/:booking_id", (req, res) => {
  const { booking_id } = req.params; // รับ booking_id จาก URL
  const { field, date, startTime, endTime, timeUsed } = req.body; // รับข้อมูลใหม่จาก request body
  console.log(booking_id, field, date, startTime, endTime, timeUsed);

  // ตรวจสอบว่าข้อมูลที่ต้องการอัปเดตครบถ้วนหรือไม่
  if (!field || !date || !startTime || !endTime || !timeUsed) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }
  const checkQuery = `
    SELECT * FROM reserve WHERE field = ? AND date = ? AND (startTime < ? AND endTime > ?)
  `;
  db.query(checkQuery, [field, date, endTime, startTime], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length > 0) {
      return res.status(400).send({ message: 'เวลานี้ถูกจองแล้ว' });
    }
    const sql = `
    UPDATE reserve 
    SET field = ?, date = ?, startTime = ?, endTime = ?, timeUsed = ?
    WHERE booking_id = ?
  `;
    db.query(sql, [field, date, startTime, endTime, timeUsed, booking_id], (err, result) => {
      if (err) {
        console.error("Error updating booking:", err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ไม่พบข้อมูลการจองที่ต้องการอัปเดต" });
      }
      res.status(200).json({ message: "อัปเดตข้อมูลสำเร็จ" });
    });
  }
  )
});

app.get('/api/reserves/daily', async (req, res) => {
  try {
    const query = `
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM reserve
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // ใช้ .promise() เพื่อให้ query เป็น Promise
    db.promise().query(query)
      .then(([rows, fields]) => {
        res.json(rows); // ส่งผลลัพธ์กลับไป
      })
      .catch(error => {
        console.error("Error fetching daily reserves:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
      });
  } catch (error) {
    console.error("Error fetching daily reserves:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

app.get('/api/revenue/daily', (req, res) => {
  // Query สำหรับดึงรายได้รวมจากการจองแต่ละวัน
  try {
    const query = `
    SELECT DATE(created_at) AS date, SUM(amount) AS revenue
    FROM reserve
    GROUP BY DATE(created_at)
    ORDER BY date ASC
`

    // ใช้ .promise() เพื่อให้ query เป็น Promise
    db.promise().query(query)
      .then(([rows, fields]) => {
        res.json(rows); // ส่งผลลัพธ์กลับไป
      })
      .catch(error => {
        console.error("Error fetching daily reserves:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
      });
  } catch (error) {
    console.error("Error fetching daily reserves:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


//Iot ESP32CAM
app.post('/api/iot/check-qr', async (req, res) => {
  const { booking_id, date, startTime, endTime } = req.body;

  // ตรวจสอบว่ารับค่ามาครบหรือไม่
  if (!booking_id || !date || !startTime || !endTime) {
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
  }

  // ดึงข้อมูลจากฐานข้อมูล
  db.query('SELECT * FROM reserve WHERE booking_id = ?', [booking_id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'ไม่พบข้อมูลการจอง' });
    }

    const booking = rows[0];
    console.log("Data from API:", { booking_id, date, startTime, endTime });
    console.log("Data from DB:", {
      booking_id: booking.booking_id,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime
    });
    const isDateMatch = booking.date === date;
    const isStartTimeMatch = booking.startTime.startsWith(startTime); // เปรียบเทียบเฉพาะ HH:mm
    const isEndTimeMatch = booking.endTime.startsWith(endTime);
    console.log("Comparison Results:");
    console.log("Date Match:", isDateMatch);
    console.log("Start Time Match:", isStartTimeMatch);
    console.log("End Time Match:", isEndTimeMatch);

    if (!isDateMatch || !isStartTimeMatch || !isEndTimeMatch) {
      return res.status(400).json({
        status: 'fail',
        message: 'ข้อมูลไม่ตรงกับที่บันทึกไว้'
      });
    }

    // ตรวจสอบว่าขณะนี้อยู่ในช่วงเวลาที่จองไว้หรือไม่
    const now = dayjs().tz("Asia/Bangkok");
    const startDateTime = dayjs.tz(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm', "Asia/Bangkok");
    const endDateTime = dayjs.tz(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm', "Asia/Bangkok");
    console.log("Current Time:", now.format());
    console.log("Start DateTime:", startDateTime.format());
    console.log("End DateTime:", endDateTime.format());

    if (now.isAfter(startDateTime) && now.isBefore(endDateTime)) {
      return res.status(200).json({ status: 'ok', message: 'อยู่ในช่วงเวลาที่จอง' });
    } else {
      return res.status(400).json({ status: 'fail', message: 'ไม่อยู่ในช่วงเวลาที่จอง' });
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app
