import React from 'react';

export default function ProjectsGrid({ projects, limit }) {
  const displayProjects = limit ? projects.slice(0, limit) : projects;

  return (
    <section className="fade-in" style={{ marginTop: '5rem', width: '100%' }}>
      <div className="section-header">
        <h2 className="section-title">Featured projects</h2>
        {limit && projects.length > limit && (
          <span className="section-link font-mono" style={{ cursor: 'pointer' }}>
            Scroll to see more
          </span>
        )}
      </div>

      <div className="projects-grid">
        {displayProjects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-content">
              <div className="project-card-header">
                <h3 className="project-card-title">{project.title}</h3>
                <div className="project-card-links">
                  {project.github && (
                    <a 
                      href={project.github} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="project-card-link"
                      title="View GitHub Repository"
                    >
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
                      >
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                        <path d="M9 18c-4.51 2-5-2-7-2"></path>
                      </svg>
                    </a>
                  )}
                  {project.live && (
                    <a 
                      href={project.live} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="project-card-link"
                      title="View Live Demo"
                    >
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
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
              
              <p className="project-card-desc">{project.description}</p>
              
              <div className="project-card-tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="project-card-tag font-mono">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
