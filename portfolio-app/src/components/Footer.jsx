import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">
          &copy; {currentYear} Anubhav Singh. All rights reserved.
        </p>
        <p className="footer-tagline">
          Built with care &middot; dark by default
        </p>
      </div>
    </footer>
  );
}
