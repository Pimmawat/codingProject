import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className='container'>
      <center>
        <h1>ยินดีต้อนรับสู่ระบบจองสนามกีฬา!</h1>
        <a href="/booking">จองสนาม</a>
        <p>กรุณาเลือกการดำเนินการจากเมนูด้านบน</p>
      </center>
    </div>
  );
};

export default Home;
