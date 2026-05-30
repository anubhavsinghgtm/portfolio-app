import React from 'react';
import { Link } from 'react-router-dom';

export default function BlogSection({ articles, limit }) {
  const displayArticles = limit ? articles.slice(0, limit) : articles;

  return (
    <section className="fade-in" style={{ marginTop: '5rem', width: '100%' }}>
      <div className="section-header">
        <h2 className="section-title">Latest writing</h2>
        {limit && articles.length > limit && (
          <Link to="/blog" className="section-link font-mono">
            View all posts
          </Link>
        )}
      </div>

      <div className="blog-feed">
        {displayArticles.length === 0 ? (
          <p className="blog-empty">No articles published yet. Stay tuned!</p>
        ) : (
          displayArticles.map((article) => (
            <article key={article.id} className="blog-item">
              <div className="blog-meta">
                <span className="blog-category">{article.category}</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <span className="blog-date">{article.date}</span>
                <span style={{ opacity: 0.3 }}>·</span>
                <span className="blog-read-time" style={{ color: 'var(--muted-foreground)' }}>
                  {article.readingTime}
                </span>
              </div>
              
              <h3 className="blog-title">
                <Link to={`/blog/${article.id}`}>
                  {article.title}
                </Link>
              </h3>
              
              <p className="blog-excerpt">{article.excerpt}</p>
              
              <Link 
                to={`/blog/${article.id}`}
                className="blog-read-more font-mono"
                style={{ display: 'inline-flex', alignItems: 'center' }}
              >
                <span>Read article</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ marginLeft: '0.35rem' }}
                >
                  <path d="M7 7h10v10"></path>
                  <path d="M7 17 17 7"></path>
                </svg>
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
