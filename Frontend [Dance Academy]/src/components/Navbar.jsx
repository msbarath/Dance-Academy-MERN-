import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const isActive = (path) => pathname === path ? 'active' : '';

  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">Dance Academy</Link>
      <nav className="navbar-links">
        <Link to="/" className={isActive('/')}>Home</Link>
        <Link to="/about" className={isActive('/about')}>About Us</Link>
        <Link to="/faq" className={isActive('/faq')}>FAQ</Link>
        <Link to="/contact" className={isActive('/contact')}>Contact Us</Link>
        <Link to="/privacy" className={isActive('/privacy')}>Privacy Policy</Link>
        <Link to="/terms" className={isActive('/terms')}>Terms &amp; Conditions</Link>
        <Link to="/admin" className={isActive('/admin')}>Admin Dashboard</Link>
      </nav>
      <div className="navbar-right">
        {user ? (
          <div className="navbar-user">
            <span className="user-greeting">Hi, {user.name}</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="navbar-auth">
            <Link to="/login" className="btn-outline">Login</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
