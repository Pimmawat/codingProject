import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import './css/Navbar.css';
import { useUser } from './userContext';

function Navbar1() {
  const [admin, setAdmin] = useState(null);
  const { user, logout } = useUser();
  const navigate = useNavigate();

  // ดึงข้อมูลจาก localStorage เมื่อ component โหลด
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('adminData')) || null;
    if (userData) {
      setAdmin(userData);  // อัพเดตสถานะ admin
    }
  }, [setAdmin]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);  // อัพเดตสถานะ admin
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="white" className="shadow-sm py-3 fixed-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="text-dark fw-bold d-flex align-items-center">
          <img src="/logo.svg" alt="Logo" className="logo me-2" style={{ width: '40px', height: '40px' }} />
          Bookings
        </Navbar.Brand>
        <Navbar.Collapse className="justify-content-end">
          {user ? (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="outline-primary"
                id="dropdown-basic"
                className="d-flex align-items-center"
              >
                <img
                  src="/profile-placeholder.png"
                  alt="Profile"
                  className="rounded-circle me-2"
                  style={{ width: '30px', height: '30px' }}
                />
                {user.name}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <>
                  <Dropdown.Item as={Link} to="/profile">แก้ไขโปรไฟล์</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/booking">จองสนาม</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/ticket">ประวัติของฉัน</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/points">แต้มของฉัน</Dropdown.Item>
                </>
                <Dropdown.Item onClick={handleLogout}>ออกจากระบบ</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : admin ? (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="outline-primary"
                id="dropdown-admin"
                className="d-flex align-items-center"
              >
                <img
                  src="/profile-placeholder.png"
                  alt="Profile"
                  className="rounded-circle me-2"
                  style={{ width: '30px', height: '30px' }}
                />
                แอดมิน
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <>
                  <Dropdown.Item as={Link} to="/admin/dashboard">แดชบอร์ด</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/admin/users">จัดการผู้ใช้งาน</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/admin/bookings">จัดการการจองสนาม</Dropdown.Item>
                </>
                <Dropdown.Item onClick={handleLogout}>ออกจากระบบ</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Nav>
              <Nav.Link as={Link} to="/login" className="text-primary fw-medium hover-link me-3">
                เข้าสู่ระบบ
              </Nav.Link>
              <Nav.Link as={Link} to="/register" className="text-dark fw-medium hover-link">
                สมัครสมาชิก
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navbar1;
