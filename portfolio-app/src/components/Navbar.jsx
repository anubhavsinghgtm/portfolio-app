import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  
  const tabs = [
    { path: '/', label: 'Home' },
    { path: '/projects', label: 'Projects' },
    { path: '/blog', label: 'Writing' }
  ];

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link 
          to="/" 
          className="navbar-brand font-serif text-lg flex items-center gap-2.5"
        >
          <span className="navbar-dot"></span>
          <span className="text-foreground font-semibold">Anubhav Singh</span>
        </Link>
        
        <nav className="navbar-menu">
          {tabs.map((tab) => {
            // High-fidelity active tab detection including sub-routes (e.g. /blog/postgres-scaling keeps Writing tab active)
            const isTabActive = tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path);

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`navbar-link font-sans text-sm cursor-pointer transition-colors ${
                  isTabActive ? 'active' : ''
                }`}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem 0.5rem',
                  outline: 'none',
                  textDecoration: 'none'
                }}
              >
                {tab.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
