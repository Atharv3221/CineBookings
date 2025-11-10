import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ theme, toggleTheme }) {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="logo">
            <span className="logo-icon">🎬</span>
            <span className="logo-text">CineAI</span>
          </Link>
          
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
