import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { currentUser } from '../data/dummyData';
import './Navbar.css';

const navLinks = [
  { to: '/dashboard',      label: 'ראשי' },
  { to: '/calendar',       label: 'לוח שנה' },
  { to: '/tasks',          label: 'משימות' },
  { to: '/family-members', label: 'בני משפחה' },
  { to: '/settings',       label: 'הגדרות' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = currentUser.name
    .split(' ')
    .map((w) => w[0])
    .join('');

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon">🏠</span>
          <span className="brand-name">Family Time</span>
        </Link>

        <nav className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="navbar-actions">
          <button
            className="btn btn-accent btn-sm"
            onClick={() => { navigate('/add-event'); closeMenu(); }}
          >
            + אירוע חדש
          </button>
          <Link to="/profile" className="navbar-avatar avatar avatar-sm" onClick={closeMenu}>
            {initials}
          </Link>
          <button
            className="hamburger"
            aria-label="תפריט"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
