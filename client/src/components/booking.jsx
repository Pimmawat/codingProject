import React, { useState, useEffect } from 'react';
import './css/Booking.css';
import Swal from 'sweetalert2';
import { useUser } from './userContext';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';
const apiUrl = import.meta.env.VITE_API_URL;

const Booking = () => {
    const { user } = useUser();
    const [field, setField] = useState('');  // สำหรับการเลือกสนาม
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [timeDiff, setTimeDiff] = useState(null);
    const [bookedTimes, setBookedTimes] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/bookings`);
                const data = await response.json();
                setBookedTimes(data);  // เก็บข้อมูลการจองใน state
                console.log(data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }
        };
        fetchBookings();
    }, []);

    if (!user) {
        return <Loading />;
    }

    const getFilteredBookings = () => {
        return bookedTimes.filter(
            (booking) => booking.field === field && booking.date === date
        );
    };

    const generateTimeOptions = () => {
        const times = [];
        const filteredBookings = getFilteredBookings();
        const currentDateTime = new Date(); // วันที่และเวลาปัจจุบัน
        const selectedDate = new Date(date);

        for (let hour = 8; hour <= 23; hour++) {
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            const optionTime = new Date(`${date}T${timeString}`); // สร้าง Date object สำหรับเวลาที่จะตรวจสอบ
            // ตรวจสอบว่าเวลานี้ผ่านไปแล้วหรือไม่
            const isPast = selectedDate.toDateString() === currentDateTime.toDateString()
                ? optionTime < currentDateTime
                : selectedDate < currentDateTime;

            // ตรวจสอบว่าเวลานี้ถูกจองไปแล้วหรือไม่
            const isBooked = filteredBookings.some(
                (booking) => timeString >= booking.startTime && timeString < booking.endTime
            );

            times.push({ time: timeString, disabled: isPast || isBooked });
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

        // ตรวจสอบว่าเวลาจองผ่านไปแล้วหรือไม่
        const currentDateTime = new Date();
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        if (startDateTime < currentDateTime || endDateTime < currentDateTime) {
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถจองได้',
                text: 'วันหรือเวลาที่เลือกผ่านไปแล้ว',
            });
            return;
        }

        const difference = calculateTimeDifference(startTime, endTime);
        setTimeDiff(difference);

        const bookingData = {
            id: user.id,
            field,
            date,
            startTime,
            endTime,
            timeUsed: difference,
        };

        Swal.fire({
            icon: 'success',
            title: 'การจองของคุณพร้อมแล้ว',
            text: 'ระบบกำลังพาคุณไปยังหน้าชำระเงิน',
        });

        // นำไปยังหน้าชำระเงินพร้อมข้อมูลการจอง
        navigate('/booking/payment', { state: bookingData });
    };

    return (
        <div className="booking-container-wrapper">
            <div className="booking-overlay"></div>
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
                                {time} {disabled ? 'จองแล้ว' : ''}
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

                <button type="submit" className="submit-btn">ยืนยันการจอง</button>
            </form>
        </div>
    );
};

export default Booking;