const express = require('express');
const generatePayload = require('promptpay-qr');
const qrcode = require('qrcode');

const router = express.Router();

const promptPayID = '0931713860'; 

router.post('/generate-qrcode', async (req, res) => {
    const { timeUsed } = req.body; 

    if (!timeUsed || typeof timeUsed !== 'number') {
        return res.status(400).json({ message: 'ข้อมูลเวลาไม่ถูกต้อง' });
    }

    const ratePerHour = 1;
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
