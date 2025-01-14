const express = require('express');
const generatePayload = require('promptpay-qr');
const qrcode = require('qrcode');

const router = express.Router();

const promptPayID = '0931713860'; 

router.post('/generate-qrcode', async (req, res) => {
    const { startTime, endTime } = req.body; 

    if (!startTime || !endTime || typeof startTime !== 'string' || typeof endTime !== 'string') {
        return res.status(400).json({ message: 'ข้อมูลเวลาไม่ถูกต้อง' });
    }

    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);

    let ratePerHour = 1; // default rate

    // ตรวจสอบเงื่อนไขเวลา
    if (startHour >= 8 && endHour <= 18) {
        ratePerHour = 600;
    } else if (startHour >= 18 && endHour <= 24) {
        ratePerHour = 900;
    }

    const timeUsed = (endHour - startHour); // คำนวณเวลาใช้งาน

    const amount = timeUsed * ratePerHour;

    try {
        // สร้าง PromptPay payload
        const payload = generatePayload(promptPayID, { amount });
        
        // สร้าง QR Code
        const qrCodeDataUrl = await qrcode.toDataURL(payload);
        
        res.json({
            amount,
            qrCodeUrl: qrCodeDataUrl
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้าง QR Code' });
    }
});

module.exports = router;
