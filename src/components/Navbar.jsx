import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const navLinks = [
  { to: '/dashboard',      label: 'ראשי' },
  { to: '/calendar',       label: 'לוח שנה' },
  { to: '/events',         label: 'אירועים' },
  { to: '/tasks',          label: 'משימות' },
  { to: '/family-members', label: 'בני משפחה' },
  { to: '/settings',       label: 'הגדרות' },
];

function getInitials(user) {
  const name = user?.user_metadata?.full_name || user?.email || '';
  if (name.includes('@')) return name[0].toUpperCase();
  return name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await supabase.auth.signOut();
    navigate('/login');
  };

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
            {getInitials(user)}
          </Link>
          <button className="btn btn-ghost btn-sm logout-btn" onClick={handleLogout}>
            יציאה
          </button>
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
          <button className="mobile-nav-link mobile-logout" onClick={handleLogout}>
            יציאה מהמערכת
          </button>
        </nav>
      )}
    </header>
  );
}
