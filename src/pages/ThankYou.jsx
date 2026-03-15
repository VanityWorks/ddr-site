import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function ThankYou() {
  return (
    <div className="page thank-you-page">
      <div className="thank-you-card">
        <div className="thank-you-icon">
          <Check size={32} strokeWidth={3} />
        </div>
        <h1>Thank you</h1>
        <p>Your purchase was successful. You'll receive your product shortly.</p>
        <Link to="/store" className="btn btn-primary btn-lg">Back to Store</Link>
      </div>
    </div>
  );
}
