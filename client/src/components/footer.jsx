import React from 'react';
import './css/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <p>&copy; {new Date().getFullYear()} Football Booking System. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
