import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="page page-about">
      <div className="page-about-inner">
        <h1>About DDR</h1>
        <p className="page-tagline">DevDoneRight - aka - development done right.</p>
        <div className="glass-panel about-content">
          <p>
            I focus on doing developer right, as the name implies, not over charging, nor gate keeping.
          </p>
          <h2>What we do</h2>
          <ul>
            <li>High Quality Resources</li>
            <li>Clean, maintainable code</li>
            <li>Documentation and support</li>
            <li>Regular updates</li>
          </ul>
          <h2>Contact</h2>
          <p>Questions or support? Reach out through discord. (vanity734)</p>
          <Link to="/store" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Store</Link>
        </div>
      </div>
    </div>
  );
}
