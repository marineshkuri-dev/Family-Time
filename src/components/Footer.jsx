import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand">🏠 Family Time</span>
        <span className="footer-copy">© {new Date().getFullYear()} כל הזכויות שמורות</span>
        <span className="footer-tagline">מחברים משפחות, יוצרים זיכרונות</span>
      </div>
    </footer>
  );
}
