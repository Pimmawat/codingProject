import React, { useState, useEffect } from 'react';
import './Booking.css';
import Swal from 'sweetalert2';
import { useUser } from './userContext';

const Booking = () => {
    const [field, setField] = useState('');  // สำหรับการเลือกสนาม
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [timeDiff, setTimeDiff] = useState(null);
    const [bookedTimes, setBookedTimes] = useState([]);
    const { user } = useUser(); 
    
    if (!user) {
        return <div>Loading...</div>; // แสดงผลเมื่อ user ยังไม่ถูกโหลด
      }
   
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/bookings');
                const data = await response.json();
                setBookedTimes(data);  // เก็บข้อมูลการจองใน state
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }
        };

        fetchBookings();
    }, []);


    const getFilteredBookings = () => {
        return bookedTimes.filter(
            (booking) => booking.field === field && booking.date === date
        );
    };

    const generateTimeOptions = () => {
        const times = [];
        const filteredBookings = getFilteredBookings();

        for (let hour = 17; hour <= 23; hour++) {
            const timeString = `${hour.toString().padStart(2, '0')}:00`;

            // ตรวจสอบว่าเวลานี้ถูกจองไปแล้วหรือไม่
            const isBooked = filteredBookings.some(
                (booking) => timeString >= booking.startTime && timeString < booking.endTime
            );

            times.push({ time: timeString, disabled: isBooked });
        }
        return times;
    };
    const calculateTimeDifference = (start, end) => {
        const startHour = parseInt(start.split(':')[0], 10);
        const endHour = parseInt(end.split(':')[0], 10);
        return endHour - startHour;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const difference = calculateTimeDifference(startTime, endTime);
        setTimeDiff(difference);

        const bookingData = {
            field,
            date,
            startTime,
            endTime,
            timeUsed: difference,
            name: user.name,
        };

        try {
            const response = await fetch('http://localhost:3001/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire({
                    icon: 'success',
                    title: 'จองสำเร็จ!',
                    text: 'รายละเอียด: ',
                  });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'ไม่สามารถจองได้',
                    text: 'เวลานี้ถูกจองแล้ว',
                  });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้ ลองอีกครั้งภายหลัง',
              });
        }
    };


    return (
        <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
                <label htmlFor="field">เลือกสนาม:</label>
                <select
                    id="field"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    required
                >
                    <option value="">เลือกสนาม</option>
                    <option value="สนาม 1">สนาม 1</option>
                    <option value="สนาม 2">สนาม 2</option>
                    <option value="สนาม 3">สนาม 3</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="date">เลือกวันที่:</label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    disabled={!field}
                />
            </div>

            <div className="form-group">
                <label htmlFor="start-time">เลือกเวลาเริ่มต้น:</label>
                <select
                    id="start-time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                >
                    <option value="">เลือกเวลาเริ่มต้น</option>
                    {generateTimeOptions().map(({ time, disabled }) => (
                        <option key={time} value={time} disabled={disabled}>
                            {time} {disabled ? '(จองแล้ว)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="end-time">เลือกเวลาสิ้นสุด:</label>
                <select
                    id="end-time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    disabled={!field || !date}
                >
                    <option value="">เลือกเวลาสิ้นสุด</option>
                    {generateTimeOptions().map(({ time, disabled }) => (
                        <option key={time} value={time} disabled={disabled || time <= startTime}>
                            {time} {disabled ? '(จองแล้ว)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            <div className='form-group'>
                    <label htmlFor="name">จองโดย</label>
                    <input type="text" value={user.name} disabled/>
            </div>

            <button type="submit" className="submit-btn">ยืนยันการจอง</button>

            {timeDiff !== null && (
                <div className="time-difference">
                    <p>สนามที่: {field}</p>
                    <p>เวลาที่ใช้: {timeDiff} ชั่วโมง</p>
                </div>
            )}
        </form>
    );
};

export default Booking;
