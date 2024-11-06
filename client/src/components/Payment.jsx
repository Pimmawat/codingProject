import React from 'react';
import { useLocation } from 'react-router-dom';

const Payment = () => {
    const location = useLocation();
    const { state } = location; // ดึงข้อมูลที่ส่งมาจากหน้า Booking
    console.log(state);

    if (!state) {
        return <div>ไม่พบข้อมูลการจอง</div>;
    }

    return (
        <div>
            <h2>ข้อมูลการจอง</h2>
            <p>สนาม: {state.field}</p>
            <p>วันที่: {state.date}</p>
            <p>เวลาเริ่ม: {state.startTime}</p>
            <p>เวลาสิ้นสุด: {state.endTime}</p>
            <p>เวลาที่ใช้: {state.timeUsed} ชั่วโมง</p>
            <p>จองโดย: {state.name}</p>

            {/* ส่วนของการจ่ายเงิน */}
            <button>ชำระเงิน</button>
        </div>
    );
};

export default Payment;
