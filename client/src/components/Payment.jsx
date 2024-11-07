import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Payment.css';

const Payment = () => {
    const location = useLocation();
    const { state } = location;
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [amount, setAmount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString()}`;
    };

    const handlePayment = async () => {
        if (!state || !state.timeUsed) return;
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/payment/generate-qrcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ timeUsed: state.timeUsed }),
            });

            if (response.ok) {
                const data = await response.json();
                setAmount(data.amount);
                setQrCodeUrl(data.qrCodeUrl);
                setLoading(false);
                startCountdown();
            } else {
                console.error('เกิดข้อผิดพลาดในการสร้าง QR Code');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const startCountdown = () => {
        const countdown = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(countdown);
                    setQrCodeUrl(null); // ซ่อน QR Code เมื่อหมดเวลา
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        if (!qrCodeUrl) {
            setTimeLeft(300); // ตั้งค่าใหม่ทุกครั้งที่สร้าง QR Code ใหม่
        }
    }, [qrCodeUrl]);

    return (
        <div className="payment-form">
            <h2>ข้อมูลการจอง</h2>
            <table>
                <tbody>
                    <tr>
                        <th>สนาม</th>
                        <td>{state.field}</td>
                    </tr>
                    <tr>
                        <th>วันที่</th>
                        <td>{formatDate(state.date)}</td>
                    </tr>
                    <tr>
                        <th>เวลาเริ่ม</th>
                        <td>{state.startTime}</td>
                    </tr>
                    <tr>
                        <th>เวลาสิ้นสุด</th>
                        <td>{state.endTime}</td>
                    </tr>
                    <tr>
                        <th>เวลาที่ใช้</th>
                        <td>{state.timeUsed} ชั่วโมง</td>
                    </tr>
                    <tr>
                        <th>จองโดย</th>
                        <td>{state.name}</td>
                    </tr>
                </tbody>
            </table>

            <button onClick={handlePayment} className="submit-btn" disabled={loading}>
                {loading ? 'กำลังสร้าง QR Code...' : 'สร้าง QR code'}
            </button>

            {qrCodeUrl && timeLeft > 0 ? (
                <div className="qr-code-section">
                    <h3>ชำระเงิน {amount} บาท</h3>
                    <p>กรุณาชำระภายใน {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} นาที</p>
                    <img src={qrCodeUrl} alt="QR Code สำหรับชำระเงิน" />
                </div>
            ) : qrCodeUrl && timeLeft === 0 ? (
                <p>QR Code หมดอายุแล้ว กรุณาสร้างใหม่</p>
            ) : null}
        </div>

    );
};

export default Payment;
