import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette({ isOpen, onClose, articles = [] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Define command categories & items
  const navigationItems = [
    { id: 'nav-home', category: 'Navigation', title: 'Go to Home', icon: '🏠', action: () => navigate('/') },
    { id: 'nav-projects', category: 'Navigation', title: 'Go to Projects', icon: '⚡', action: () => navigate('/projects') },
    { id: 'nav-blog', category: 'Navigation', title: 'Go to Writing & Articles', icon: '✍️', action: () => navigate('/blog') }
  ];

  const projectItems = [
    { id: 'proj-fluxora', category: 'Projects', title: 'Fluxora — AI SQL Generator', icon: '🤖', action: () => window.open('https://anubhav-fluxora.streamlit.app/', '_blank') },
    { id: 'proj-pulse', category: 'Projects', title: 'PULSE — Vaccine Sentiment Classification', icon: '📊', action: () => window.open('https://github.com/anubhavsinghgtm/pulse', '_blank') },
    { id: 'proj-aayronix', category: 'Projects', title: 'Aayronix Hub — Consultancy Platform', icon: '🌐', action: () => window.open('https://aayronixhub.com', '_blank') }
  ];

  const actionItems = [
    { 
      id: 'act-email', 
      category: 'Quick Actions', 
      title: 'Copy Email Address (anubhavsinghgtm@gmail.com)', 
      icon: '📧', 
      action: () => {
        navigator.clipboard.writeText('anubhavsinghgtm@gmail.com');
        alert('Email copied to clipboard!');
      } 
    },
    { id: 'act-github', category: 'Quick Actions', title: 'Open GitHub Profile', icon: '🐙', action: () => window.open('https://github.com/anubhavsinghgtm', '_blank') },
    { id: 'act-linkedin', category: 'Quick Actions', title: 'Open LinkedIn Profile', icon: '💼', action: () => window.open('https://www.linkedin.com/in/anubhavsinghgtm/', '_blank') },
    { id: 'act-twitter', category: 'Quick Actions', title: 'Open Twitter Profile', icon: '🐦', action: () => window.open('https://twitter.com/anubhavsinghgtm', '_blank') }
  ];

  const articleItems = articles.map(art => ({
    id: `art-${art.id}`,
    category: 'Writing',
    title: art.title,
    icon: '📝',
    action: () => navigate(`/blog/${art.id}`)
  }));

  const allItems = [...navigationItems, ...projectItems, ...articleItems, ...actionItems];

  const filteredItems = allItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="cmd-palette-backdrop" onClick={onClose}>
      <div className="cmd-palette-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-palette-header">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="cmd-search-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="cmd-palette-input font-mono"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span className="cmd-esc-hint font-mono">ESC</span>
        </div>

        <div className="cmd-palette-results">
          {filteredItems.length === 0 ? (
            <div className="cmd-palette-empty font-mono text-sm">
              No matching commands found.
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className={`cmd-palette-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <span className="cmd-item-icon">{item.icon}</span>
                <span className="cmd-item-title">{item.title}</span>
                <span className="cmd-item-badge font-mono">{item.category}</span>
              </div>
            ))
          )}
        </div>

        <div className="cmd-palette-footer font-mono">
          <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
          <span><kbd>↵</kbd> to select</span>
          <span><kbd>ESC</kbd> to dismiss</span>
        </div>
      </div>
    </div>
  );
}
