const express = require('express');
const generatePayload = require('promptpay-qr');
const qrcode = require('qrcode');

const router = express.Router();

// สมมติว่าใช้หมายเลข PromptPay เป็นตัวอย่าง
const promptPayID = '0931713860'; // หมายเลขโทรศัพท์หรือเลข PromptPay ID

router.post('/generate-qrcode', async (req, res) => {
    const { timeUsed } = req.body; // ดึงข้อมูลเวลาที่ใช้จาก request

    if (!timeUsed || typeof timeUsed !== 'number') {
        return res.status(400).json({ message: 'ข้อมูลเวลาไม่ถูกต้อง' });
    }

    // คำนวณค่าใช้จ่ายโดยเอาเวลาที่ใช้คูณกับราคาต่อชั่วโมง
    const ratePerHour = 1;
    const amount = timeUsed * ratePerHour;

    try {
        // สร้าง PromptPay payload
        const payload = generatePayload(promptPayID, { amount });
        
        // สร้าง QR Code
        const qrCodeDataUrl = await qrcode.toDataURL(payload);
        
        // ส่ง URL ของ QR Code กลับไปให้ frontend
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
