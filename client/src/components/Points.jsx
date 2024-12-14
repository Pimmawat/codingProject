import React, { useEffect, useState } from 'react';
import { useUser } from './userContext';
import './css/Points.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
const apiUrl = import.meta.env.VITE_API_URL;

const Points = () => {
  const { user } = useUser();
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/points?user_id=${user.id}`);
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
      navigate('/redeem/booking', { state: { totalPoints } });
    } else {
      Swal.fire({
        title: 'แลกแต้มไม่ได้!',
        text: 'แต้มของท่านไม่เพียงพอ',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
      });
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
        className={`redeem-button ${totalPoints >= 100 ? 'active' : 'disabled'}`}
        onClick={handleRedeemPoints}
      >
        {totalPoints >= 100 ? 'แลกแต้มเพื่อจองสนามฟรี' : 'แต้มไม่เพียงพอ'}
      </button>
    </div>
  );
};

export default Points;
