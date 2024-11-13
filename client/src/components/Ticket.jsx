import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import './Ticket.css';
import Loading from './Loading';
import { useUser } from './userContext';

const Ticket = () => {
    const { user } = useUser();
    const [bookings, setBookings] = useState(null);

    if (!user) {
        return <Loading/>
    }

    useEffect(() => {
        // ฟังก์ชันดึงข้อมูลการจอง
        const fetchBookings = async () => {
            try {
                const response = await fetch(`/api/tickets?name=${user.name}`);
                console.log("Response Status:", response.status); // ดูสถานะการตอบกลับ
        
                if (!response.ok) {
                    throw new Error(`ไม่สามารถดึงข้อมูลการจองได้ - สถานะ: ${response.status}`);
                }
        
                const data = await response.json(); // แปลง response เป็น JSON
                console.log("Data:", data); // ดูข้อมูลที่ได้รับจาก API
                setBookings(data);
            } catch (error) {
                console.log(error.message);
                setBookings([]); // กำหนดเป็นอาร์เรย์ว่างถ้าเกิดข้อผิดพลาด
            }
        };
        fetchBookings();
    }, [user.name]); 

    return (
        <div>
            <h2>ข้อมูลการจองของคุณ</h2>
            {bookings && bookings.length > 0 ? ( // ตรวจสอบว่ามีข้อมูลใน bookings
                bookings.map((booking, index) => {
                    const uniqueKey = booking.id || `booking-${index}`; // ใช้ `index` ถ้าไม่มี `id`
                    return (
                        <div key={uniqueKey} className="booking">
                            <p><strong>สนาม:</strong> {booking.field}</p>
                            <p><strong>วันที่:</strong> {booking.date}</p>
                            <p><strong>เวลา:</strong> {booking.startTime} - {booking.endTime}</p>
                            <QRCode value={`Booking ID: ${booking.id}`} size={128} />
                        </div>
                    );
                })
            ) : (
                <p>ไม่มีข้อมูลการจอง</p>
            )}
        </div>
    );
};

export default Ticket;
