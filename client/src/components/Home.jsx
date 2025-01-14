import React from 'react';
import './css/Home.css';

const Home = () => {
  return (
    <div>
      {/* Home Section */}
      <div className="home-container">
        <div className="overlay"></div>
        <div className="header">
          <h1 className="h1">ยินดีต้อนรับสู่ระบบจองสนามฟุตบอล</h1>
          <p className="sub-text">จองสนามของคุณวันนี้และสนุกกับเกมฟุตบอล!</p>
          <a href="/booking" className="booking-button">จองสนาม</a>
        </div>
        <div className="animated-bg">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
        </div>
      </div>

      {/* Promotion Section */}
      <div className="promotion-section" id="promotions">
        <h2 className="promotion-title">โปรโมชั่นพิเศษ</h2>
        <div className="promotion-container">
          <div className="promotion-item">
            <img src="/pomo1.png" alt="โปรโมชั่น 1" className="promotion-image large-image" />
            <p className="promotion-text">ค่าเช่าสนาม</p>
          </div>
          <div className="promotion-item">
            <img src="/pomo2.png" alt="โปรโมชั่น 2" className="promotion-image large-image" />
            <p className="promotion-text">โปรโมชั่น</p>
          </div>
        </div>
      </div>

      {/* Rules Section */}
      <div className="rules-section">
        <h2 className="rules-title">กฎระเบียบในการใช้งานสนามฟุตบอล</h2>
        <ul className="rules-list">
          <li>ลูกค้าที่จองสนาม ต้องมาถึงสนามก่อน 10 นาที หากมาช้ากว่าเวลากำหนด ถือว่าสละสิทธิการจองครั้งนั้น</li>
          <li>กรุณารักษาเวลาการจองใช้สนาม</li>
          <li>ไม่อนุญาตให้นำสัตว์เลี้ยงเข้าภายในสนามและบริเวณคลับเฮาส์</li>
          <li>ห้ามสูบบุหรี่ภายในสนามโดยเด็ดขาด สูบบุหรี่ในสนามปรับ 2,000 บาท สามารถสูบบุหรี่ในบริเวณที่จัดไว้ให้เท่านั้น</li>
          <li>ห้ามเล่นการพนัน</li>
          <li>ห้ามพกพาอาวุธเข้ามาในบริเวณสนามโดยเด็ดขาด</li>
          <li> กรณีที่มีการทะเลาะวิวาทในระหว่างการเล่น ทางสนามขอสงวนสิทธิการพิจารณายกเลิกการเช่าสนามนั้นในทันที โดยผู้เช่าจะต้องชำระเงินเต็มจำนวนการเช่า</li>
          <li>ห้ามนำอาหาร และขนมขบเคี้ยว เข้าภายในสนาม</li>
          <li>หากพื้นสนาม, สถานที่ และอุปกรณ์ เกิดความเสียหาย ผู้ใช้บริการจะต้องชำระค่าเสียหายตามมูลค่าจริงที่เกิดขึ้น</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
