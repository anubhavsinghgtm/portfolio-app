import React from 'react';

export default function Navbar({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'blog', label: 'Writing' }
  ];

  return (
    <header className="navbar">
      <div className="navbar-container">
        <a 
          href="#" 
          className="navbar-brand font-serif text-lg flex items-center gap-2.5"
          onClick={(e) => {
            e.preventDefault();
            setCurrentTab('home');
          }}
        >
          <span className="navbar-dot"></span>
          <span className="text-foreground font-semibold">Anubhav Singh</span>
        </a>
        
        <nav className="navbar-menu">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`navbar-link font-sans text-sm cursor-pointer transition-colors ${
                currentTab === tab.id ? 'active' : ''
              }`}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.25rem 0.5rem',
                outline: 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
