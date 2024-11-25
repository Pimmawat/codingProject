import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import './css/Navbar.css';
import { useUser } from './userContext';

function Navbar1() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
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
                <Dropdown.Item as={Link} to="/booking">จองสนาม</Dropdown.Item>
                <Dropdown.Item as={Link} to="/ticket">ดูตั๋ว</Dropdown.Item>
                <Dropdown.Item as={Link} to="/point">แลกแต้ม</Dropdown.Item>
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
