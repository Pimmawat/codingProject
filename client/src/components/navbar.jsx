import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import './Navbar.css';
import { useUser } from './userContext';


function Navbar1() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src="/logo.svg" alt="Logo" className="logo me-2" />
          Bookings
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {user ? (
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                Signed in as: {user.name}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="profile">แก้ไขโปรไฟล์</Dropdown.Item>
                <Dropdown.Item onClick={handleLogout}>ออกจากระบบ</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <div>
              <Button as={Link} to="/login" variant="outline-success" className="me-2">
                เข้าสู่ระบบ
              </Button>
              <Button as={Link} to="/register" variant="success">
                สมัครสมาชิก
              </Button>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navbar1;