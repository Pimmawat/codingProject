import React, { useEffect, useState } from 'react';
import { useUser } from './userContext';
import './css/Points.css'; // ใส่ไฟล์ CSS เพื่อเพิ่มสไตล์

const Points = () => {
  const { user } = useUser();
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      fetchPoints();
    }
  }, [user]);

  const fetchPoints = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/points?user_id=${user.id}`);
      const data = await response.json();
      console.log('Fetched points:', data); // ตรวจสอบผลลัพธ์ใน console
      setTotalPoints(data.totalPoints || 0); // ตั้งค่า totalPoints ใน state
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  if (user) {
    fetchPoints();
  }

return (
  <div className="points-container">
    <h2>แต้มสะสมของคุณ</h2>
    <div className="points-box">
      <p><strong>แต้มทั้งหมด:</strong> {totalPoints} แต้ม</p>
    </div>
  </div>
);
};

export default Points;
