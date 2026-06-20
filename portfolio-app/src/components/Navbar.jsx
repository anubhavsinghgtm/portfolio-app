import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [isHidden, setIsHidden] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lastScrollY = useRef(0);
  
  const tabs = [
    { path: '/projects', label: 'Projects' },
    { path: '/blog', label: 'Writing' }
  ];

  const isArticlePage = location.pathname.startsWith('/blog/') && location.pathname !== '/blog';

  useEffect(() => {
    // Reset scroll reference and progress on page transitions
    lastScrollY.current = window.scrollY;
    setScrollProgress(0);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Calculate scroll progress percentage if on an article page
      if (isArticlePage) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          setScrollProgress((currentScrollY / totalHeight) * 100);
        } else {
          setScrollProgress(0);
        }
      }

      // 2. Only toggle visibility if scrolled past the navbar height threshold (80px)
      if (currentScrollY > 80) {
        if (currentScrollY > lastScrollY.current) {
          setIsHidden(true); // Scrolling down -> hide navbar
        } else {
          setIsHidden(false); // Scrolling up -> show navbar
        }
      } else {
        setIsHidden(false); // Near top -> show navbar
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Initial call in case page is loaded scrolled
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname, isArticlePage]);

  return (
    <>
      <header className={`navbar ${isHidden ? 'hidden' : ''}`}>
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
      {isArticlePage && (
        <div 
          className={`reading-progress-bar ${isHidden ? 'header-hidden' : ''}`} 
          style={{ width: `${scrollProgress}%` }} 
        />
      )}
    </>
  );
}
