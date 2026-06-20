import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-header">
        <span className="landing-logo">🏠 Family Time</span>
        <div className="landing-header-actions">
          <Link to="/login" className="btn btn-outline">כניסה</Link>
          <Link to="/register" className="btn btn-primary">הרשמה חינם</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-eyebrow">ברוכים הבאים ל-Family Time 👋</div>
          <h1 className="hero-title">ניהול זמן משפחתי</h1>
          <p className="hero-subtitle">
            תאמו אירועים, חלקו משימות ושמרו על קשר עם כל בני המשפחה — הכל במקום אחד.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">התחילו עכשיו — חינם</Link>
            <Link to="/login" className="btn btn-ghost btn-lg">כבר יש לי חשבון</Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-bubble">
            <span className="hero-emoji">🗓️</span>
          </div>
          <div className="hero-float hero-float-top">
            <span>📅</span> 4 אירועים השבוע
          </div>
          <div className="hero-float hero-float-bottom">
            <span>✅</span> 3 משימות הושלמו
          </div>
        </div>
      </section>

      <section className="landing-features">
        <h2 className="section-title" style={{ textAlign: 'center' }}>למה Family Time?</h2>
        <div className="features-grid">
          {[
            { icon: '📅', title: 'לוח שנה משפחתי', desc: 'תאמו אירועים ביניכם בקלות ותמנעו קונפליקטים בלו"ז.' },
            { icon: '✅', title: 'ניהול משימות', desc: 'חלקו מטלות בית וסמנו השלמה — כולם רואים את ההתקדמות.' },
            { icon: '👨‍👩‍👧‍👦', title: 'פרופיל לכל אחד', desc: 'כל בן משפחה עם צבע ופרופיל משלו.' },
            { icon: '🔔', title: 'תזכורות חכמות', desc: 'אל תפספסו אף אירוע חשוב — תזכורות אוטומטיות.' },
          ].map((f) => (
            <div key={f.title} className="feature-card card">
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta-section">
        <h2>מוכנים להתחיל?</h2>
        <p>הצטרפו לאלפי משפחות שכבר מנהלות את חייהן בחכמה</p>
        <Link to="/register" className="btn btn-accent btn-lg">הרשמה חינם</Link>
      </section>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Family Time — מחברים משפחות, יוצרים זיכרונות</span>
      </footer>
    </div>
  );
}
