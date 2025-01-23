const express = require('express');
const generatePayload = require('promptpay-qr');
const qrcode = require('qrcode');

const router = express.Router();

const promptPayID = '0931713860'; 

router.post('/generate-qrcode', async (req, res) => {
    const { totalPrice } = req.body; 

    if (!totalPrice || totalPrice <= 0) {
        return res.status(400).json({ message: 'Invalid total price' });
    }

    try {
        // สร้าง PromptPay payload
        const payload = generatePayload(promptPayID, { amount: totalPrice });
        
        // สร้าง QR Code
        const qrCodeDataUrl = await qrcode.toDataURL(payload);
        
        res.json({
            amount: totalPrice,
            qrCodeUrl: qrCodeDataUrl
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้าง QR Code' });
    }
});

module.exports = router;