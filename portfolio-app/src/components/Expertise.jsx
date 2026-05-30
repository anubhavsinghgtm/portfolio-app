import React from 'react';

export default function Expertise() {
  const domains = [
    {
      id: 'ai-genai',
      title: 'Generative AI & Deep Learning',
      description: 'Custom LLM pipeline orchestration, advanced schema-aware prompting, vaccine hesitancy multi-label deep classification models (Nested LSTMs), and deep explainable transparent algorithms (LIME).',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.75" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="expertise-icon"
        >
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          <rect x="9" y="9" width="6" height="6"></rect>
          <line x1="9" y1="1" x2="9" y2="4"></line>
          <line x1="15" y1="1" x2="15" y2="4"></line>
          <line x1="9" y1="20" x2="9" y2="23"></line>
          <line x1="15" y1="20" x2="15" y2="23"></line>
          <line x1="20" y1="9" x2="23" y2="9"></line>
          <line x1="20" y1="15" x2="23" y2="15"></line>
          <line x1="1" y1="9" x2="4" y2="9"></line>
          <line x1="1" y1="15" x2="4" y2="15"></line>
        </svg>
      )
    },
    {
      id: 'backend-apis',
      title: 'Backend & Robust APIs',
      description: 'Engineered backend microservices utilizing FastAPI, structured database schemas in PostgreSQL, scalable deployment clusters via Supabase and Docker, and resilient automated testing suites with Pytest.',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.75" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="expertise-icon"
        >
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6" y2="6.01"></line>
          <line x1="6" y1="18" x2="6" y2="18.01"></line>
        </svg>
      )
    },
    {
      id: 'web-architectures',
      title: 'Modern Web Architectures',
      description: 'Designing high-performance corporate multi-page websites utilizing Astro, dynamic client interfaces with React/Tailwind, and fluidly custom glassmorphism typography schemes.',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.75" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="expertise-icon"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      )
    }
  ];

  return (
    <section className="expertise-section fade-in">
      <div className="section-header">
        <h2 className="section-title">Core Expertise</h2>
      </div>

      <div className="expertise-grid">
        {domains.map((domain) => (
          <div key={domain.id} className="expertise-card">
            <div className="expertise-content">
              <div className="expertise-icon-wrapper">
                {domain.icon}
              </div>
              <h3 className="expertise-title">{domain.title}</h3>
              <p className="expertise-desc">{domain.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
