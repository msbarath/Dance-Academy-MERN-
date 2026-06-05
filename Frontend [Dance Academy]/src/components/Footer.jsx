import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="footer-logo">Dance Academy</span>
          <p>Inspiring movement, building confidence, and creating unforgettable dance journeys.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        <div className="footer-links">
          <h4>Legal</h4>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
        </div>
        <div className="footer-links">
          <h4>Join Us</h4>
          <Link to="/signup">Sign Up</Link>
          <Link to="/login">Login</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Dance Academy. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
