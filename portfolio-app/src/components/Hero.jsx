import React from 'react';

export default function Hero({ setCurrentTab }) {
  const technologies = [
    'FastAPI', 'Postgres', 'Spark', 'AWS', 'React', 'Python', 'Docker', 'GraphQL'
  ];

  return (
    <section className="hero-section fade-in">
      <p className="hero-label font-mono">Software developer</p>

      <h1 className="hero-title">
        Anubhav Singh.<br />
        <span className="hero-subtitle">Backend &amp; data engineer.</span>
      </h1>

      <p className="hero-description">
        I build dependable backends and data pipelines — designing APIs with{' '}
        <span className="hero-highlight">FastAPI</span>, modeling data in{' '}
        <span className="hero-highlight">Postgres</span>, processing at scale with{' '}
        <span className="hero-highlight">Spark</span>, and shipping on{' '}
        <span className="hero-highlight">AWS</span>. This corner of the internet is also where I keep notes on what I'm learning and the occasional thought about life.
      </p>

      <div className="tech-pills">
        {technologies.map((tech) => (
          <span key={tech} className="tech-pill font-mono">{tech}</span>
        ))}
      </div>

      <div className="social-links">
        <a
          href="https://github.com/anubhavsinghgtm"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="social-icon"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
            <path d="M9 18c-4.51 2-5-2-7-2"></path>
          </svg>
          <span>GitHub</span>
        </a>

        <a
          href="https://www.linkedin.com/in/anubhavsinghgtm/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="social-icon"
          >
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
          <span>LinkedIn</span>
        </a>

        <a
          href="mailto:[EMAIL_ADDRESS]"
          className="social-link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="social-icon"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>Email</span>
        </a>
      </div>
    </section>
  );
}
