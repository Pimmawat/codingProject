import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import './Navbar.css';
import { useUser } from './userContext';

function Navbar1() {
  const { user } = useUser(); 

  return (
    <Navbar className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/">Bookings</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {user ? (
            <Navbar.Text>
              Signed in as: <a href="#profile">{user.name}</a>
            </Navbar.Text>
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
