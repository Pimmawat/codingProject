import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './css/Payment.css';
import Loading from './Loading';

const Redeem = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  if (!state) {
    <Loading />
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่มีข้อมูลการจอง กรุณาลองอีกครั้ง',
    }).then(() => navigate('/points'));
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleRedeemPoint = async () => {
    const requiredPoints = state.timeUsed * 100;

    if (state.totalPoints < requiredPoints) {
      Swal.fire({
        icon: 'warning',
        title: 'แต้มไม่เพียงพอ',
        text: `คุณมีแต้มเพียง ${state.totalPoints} แต้ม แต่ต้องการ ${requiredPoints} แต้มในการแลก`,
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/redeem/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });

      const responseData = await response.json();
      if (response.ok) {
        Swal.fire({
          title: 'จองสำเร็จ',
          text: responseData.message,
          icon: 'success',
          confirmButtonText: 'ตกลง',
        }).then(() => navigate('/ticket'));
      } else {
        throw new Error(responseData.message);
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองอีกครั้ง',
      });
    }
  };

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
        </tbody>
      </table>
      <div className="points-box">
        <div className="points-total">แลก {state.timeUsed * 100} แต้ม</div>
      </div>
      <div className="upload-section">
        <button onClick={handleRedeemPoint} className="submit-btn">
          แลกแต้ม
        </button>
      </div>
    </div>
  );
};

export default Redeem;
