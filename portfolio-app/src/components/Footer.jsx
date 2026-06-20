import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    if (!supabase) {
      // Mock Supabase subscription in offline demo mode
      setTimeout(() => {
        setIsLoading(false);
        setStatus({
          type: 'success',
          message: 'Thanks for subscribing! (Demo mode)'
        });
        setEmail('');
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // postgres unique constraint error code
          setStatus({
            type: 'error',
            message: 'This email is already subscribed!'
          });
        } else {
          setStatus({
            type: 'error',
            message: error.message || 'Failed to subscribe. Please try again.'
          });
        }
      } else {
        setStatus({
          type: 'success',
          message: 'Thanks for subscribing!'
        });
        setEmail('');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="newsletter-info">
            <h3 className="newsletter-title">Scale Your Knowledge</h3>
            <p className="newsletter-desc">
              Get raw, detailed case studies on database scaling, search algorithms, and custom LLM compilation patterns. No spam, ever.
            </p>
          </div>
          <div className="newsletter-form-container">
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="newsletter-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {status.message && (
              <div className={`newsletter-status ${status.type}`}>
                {status.message}
              </div>
            )}
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-text">
            &copy; {currentYear} Anubhav Singh. All rights reserved.
          </p>
          <p className="footer-tagline">
            Built with care &middot; dark by default
          </p>
        </div>
      </div>
    </footer>
  );
}
