import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className='header'>
        <h1>ยินดีต้อนรับสู่ระบบจองสนามกีฬา!</h1>
        <a href="/booking">จองสนาม</a><br />
        <a href="/ticket">ตั๋ว</a>
        <p>กรุณาเลือกการดำเนินการจากเมนูด้านบน</p>
    </div>
  );
};

export default Home;
