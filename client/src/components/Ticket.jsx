import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import './css/Ticket.css';
import Loading from './Loading';
import { useUser } from './userContext';
const apiUrl = import.meta.env.VITE_API_URL;


const Ticket = () => {
    const { user } = useUser();
    const [bookings, setBookings] = useState(null);
    const [showQRCode, setShowQRCode] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

    console.log(user.id); // เปลี่ยนจาก phone เป็น user_id

    if (!user.id) {
        return <Loading />;
    }

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/tickets?user_id=${user.id}`); // ใช้ user_id แทน phone
                const data = await response.json();
                console.log(data);
                setBookings(data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }
        };
        fetchBookings();
    }, [user.id]);

    const openModal = (bookingId) => {
        console.log('Selected Booking ID:', bookingId);
        setSelectedBookingId(bookingId);
        setShowQRCode(true);
    };

    const closeModal = () => {
        setSelectedBookingId(null);
        setShowQRCode(false);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const sortedBookings = bookings ? [...bookings].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        return 0;
    }) : [];

    // ดึงข้อมูลการจองที่เลือก
    const selectedBooking = bookings?.find(
        (booking) => booking.booking_id === selectedBookingId
    );
    console.log('Sorted bookings:', sortedBookings);

    return (
        <div className="ticket-container">
            <h2>ข้อมูลการจองของคุณ</h2>
            {sortedBookings.length > 0 ? (
                <table className="booking-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('date')}>วันที่ {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                            <th onClick={() => handleSort('startTime')}>เวลา {sortConfig.key === 'startTime' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                            <th onClick={() => handleSort('field')}>สนาม {sortConfig.key === 'field' && (sortConfig.direction === 'asc' ? '▲' : '▼')}</th>
                            <th>QR Code</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedBookings.map((booking, index) => {
                            const isExpired = new Date(`${booking.date}T${booking.endTime}`) < new Date(); // ตรวจสอบว่าการจองหมดอายุหรือยัง
                            return (
                                <tr key={booking.booking_id || `booking-${index}`}>
                                    <td>{formatDate(booking.date)}</td>
                                    <td>{booking.startTime} - {booking.endTime}</td>
                                    <td>{booking.field}</td>
                                    <td>
                                        <button
                                            onClick={() => openModal(booking.booking_id)}
                                            className="qr-button"
                                            disabled={isExpired} // ปิดการใช้งานถ้าเลยเวลาสิ้นสุด
                                        >
                                            {isExpired ? 'หมดเวลา' : 'แสดง QR Code'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <p className="no-bookings">ไม่มีข้อมูลการจอง</p>
            )}
            {showQRCode && selectedBooking ? (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h3>QR Code การจอง</h3>
                        <QRCode
                            className="qr-code"
                            value={JSON.stringify({
                                booking_id: selectedBooking.booking_id,
                                date: selectedBooking.date,
                                startTime: selectedBooking.startTime,
                                endTime: selectedBooking.endTime,
                            })}
                            size={128}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Ticket;
