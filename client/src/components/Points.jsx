import React, { useEffect, useState } from 'react';
import { useUser } from './userContext';
import './css/Points.css'; // ใส่ไฟล์ CSS เพื่อเพิ่มสไตล์
import { useNavigate } from 'react-router-dom';

const Points = () => {
  const { user } = useUser();
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/points?user_id=${user.id}`);
        const data = await response.json();
        const pointsSum = data.reduce((total, item) => total + item.points, 0);
        setTotalPoints(pointsSum);
      } catch (error) {
        console.error('Error fetching points:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchPoints();
    }
  }, [user]);

  const handleRedeemPoints = () => {
    if (totalPoints >= 100) {
      alert('คุณได้แลกแต้มสำเร็จ! นำไปใช้สำหรับการจองสนามฟรี');
      navigate('/booking');
    } else {
      alert('แต้มของคุณไม่เพียงพอสำหรับการแลก');
    }
  };

  if (loading) {
    return <div className="loading">กำลังโหลด...</div>;
  }

  return (
    <div className="points-container">
      <h2 className="points-header">แต้มสะสมของคุณ</h2>
      <div className="points-box">
        <p>
          <strong><span className="points-total">{totalPoints} แต้ม</span></strong> 
        </p>
      </div>
      <button
        className={`redeem-button ${totalPoints >= 150 ? 'active' : 'disabled'}`}
        onClick={handleRedeemPoints}
        disabled={totalPoints < 150}
      >
        {totalPoints >= 150 ? 'แลกแต้มเพื่อจองสนามฟรี' : 'แต้มไม่เพียงพอ'}
      </button>
    </div>
  );
};

export default Points;

