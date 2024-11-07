const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const paymentRoute = require('./payment');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const JWT_SECRET = 'hellohackerman';

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});


app.post('/api/bookings', (req, res) => {
  const { field, date, startTime, endTime, timeUsed, name } = req.body;
  console.log(field, date, startTime, endTime, timeUsed, name);

  const checkQuery = `
SELECT * FROM reserve WHERE field = ? AND date = ? AND (startTime < ? AND endTime > ?)
  `;
  db.query(checkQuery, [field, date, endTime, startTime], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length > 0) {
      return res.status(400).send({ message: 'เวลานี้ถูกจองแล้ว' });
    }

    const query = `INSERT INTO reserve (field, date, startTime, endTime, timeUsed, name) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(query, [field, date, startTime, endTime, timeUsed, name], (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ message: 'จองสำเร็จ', bookingId: result.insertId });
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
  const { name, phone, password } = req.body;
  console.log('Request body:', req.body);

  if (!name || !phone || !password) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const checkQuery = 'SELECT * FROM users WHERE phone = ?';
  db.query(checkQuery, [phone], (err, existingUser) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเช็คเบอร์โทร' });
    }

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'เบอร์โทรนี้ถูกใช้ไปแล้ว' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน' });
      }

      const insertQuery = 'INSERT INTO users (name, phone, password) VALUES (?, ?, ?)';
      db.query(insertQuery, [name, phone, hash], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
        }
        return res.status(201).json({ message: 'ลงทะเบียนสำเร็จ', userId: result.insertId });
      });
    });
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
      return res.status(200).json({ message: 'Login successful', name: user.name, token });
    });
  });
});

app.post('https://api.slipok.com/api/line/apikey/30828',(req,res) => {

  try {
    const branchId = "30828";
    const apiKey = "<YOUR_API_KEY>";
    const path = req;
    const buffer = fs.readFileSync(path);

    const res = axios.post(
      `https://api.slipok.com/api/line/apikey/${branchId}`,
      {
        files: buffer,
        log: true,
        // amount: number, // Add this to check with amount of the slip
      },
      {
        headers: {
          "x-authorization": apiKey,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    // Handle success slip
    const slipData = res.data.data;
    console.log(slipData);
  } catch (err) {
    // Handle invalid slip
    if (axios.isAxiosError(err)) {
      const errorData = err.response.data;
      console.log(errorData.code); // Check error code
      console.log(errorData.message); // Check error message
      return;
    }
    console.log(err);
  }

});

app.use('/api/payment', paymentRoute);

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
